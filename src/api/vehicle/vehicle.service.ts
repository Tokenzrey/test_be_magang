import { StatusCodes } from "http-status-codes";
import vehicleRepository from "./vehicle.repository";
import { telementryLogRepository } from "@/api/telementryLog/telementryLog.repository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { logger } from "@/server";
import { verifyAccessToken } from "@/common/utils/jwtToken";

/**
 * Service class for vehicle business logic and telemetry log access.
 * Vehicles and TelemetryLogs are always bound to user_id:
 * - USER role can only CRUD their own vehicles and telemetry logs.
 * - ADMIN can CRUD all.
 */
export class VehicleService {
	constructor(
		private repo = vehicleRepository,
		private telemetryRepo = telementryLogRepository
	) {}

	/**
	 * Extracts user info (id, role) from access token.
	 */
	private extractUser(
		accessToken?: string
	): { id: number; role: string } | null {
		if (!accessToken) return null;
		try {
			return verifyAccessToken(accessToken);
		} catch {
			return null;
		}
	}

	/**
	 * Checks if the user is allowed to access the resource.
	 * @param user - current user
	 * @param resourceUserId - owner user_id of the resource
	 * @returns true if allowed, false otherwise
	 */
	private isAllowed(
		user: { id: number; role: string },
		resourceUserId: number
	): boolean {
		if (user.role === "ADMIN") return true;
		return user.id === resourceUserId;
	}

	/**
	 * Create a vehicle, bound to user_id from accessToken. Only admins can specify user_id of another user.
	 */
	async create(
		data: {
			name: string;
			license_plate: string;
			model?: string | null;
			status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
			user_id?: number; // Allow admin to create for other user
		},
		accessToken?: string
	) {
		logger.debug(
			{ data, where: "VehicleService.create" },
			"Create vehicle request"
		);

		const user = this.extractUser(accessToken);
		if (!user) {
			return ServiceResponse.failure(
				"Missing or invalid access token.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}

		try {
			const existing = await this.repo.findByLicensePlate(data.license_plate);
			if (existing) {
				logger.debug(
					{ license_plate: data.license_plate, where: "VehicleService.create" },
					"License plate already exists"
				);
				return ServiceResponse.failure(
					"License plate already exists.",
					null,
					StatusCodes.CONFLICT
				);
			}
			let saveUserId = user.id;
			if (user.role === "ADMIN" && data.user_id) {
				saveUserId = data.user_id;
			}
			const vehicle = await this.repo.createVehicle({
				...data,
				user_id: saveUserId,
			});
			logger.debug(
				{ id: vehicle.id, where: "VehicleService.create" },
				"Vehicle created"
			);
			return ServiceResponse.success(
				"Vehicle created.",
				vehicle.toJSON(),
				StatusCodes.CREATED
			);
		} catch (ex) {
			logger.error(
				{ error: (ex as Error).message, where: "VehicleService.create" },
				"Error creating vehicle"
			);
			return ServiceResponse.failure(
				"An error occurred while creating vehicle.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Get paginated, filtered list of vehicles with latest telemetry log per vehicle.
	 * USER: only see their own vehicles.
	 * ADMIN: see all.
	 */
	async findAll(
		opts: {
			search?: string;
			status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
			page?: number;
			limit?: number;
		},
		accessToken?: string
	) {
		logger.debug(
			{ opts, where: "VehicleService.findAll" },
			"Find all vehicles request"
		);

		const user = this.extractUser(accessToken);
		if (!user) {
			return ServiceResponse.failure(
				"Missing or invalid access token.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}

		try {
			const repoOpts = { ...opts };
			if (user.role !== "ADMIN") {
				// Only include own vehicles
				(repoOpts as any).user_id = user.id;
			}
			const { rows, count } = await this.repo.findVehicles(repoOpts);
			const data = await Promise.all(
				rows.map(async (v) => {
					const latestTelemetry =
						await this.telemetryRepo.getLatestTelemetryLog(v.id);
					return {
						...v.toJSON(),
						latestTelemetry: latestTelemetry ? latestTelemetry.toJSON() : null,
					};
				})
			);
			logger.debug(
				{ count, where: "VehicleService.findAll" },
				"Vehicles fetched"
			);
			return ServiceResponse.success("Vehicles found.", {
				data,
				pagination: {
					total: count,
					page: opts.page || 1,
					limit: opts.limit || 10,
					pages: Math.ceil(count / (opts.limit || 10)),
				},
			});
		} catch (ex) {
			logger.error(
				{ error: (ex as Error).message, where: "VehicleService.findAll" },
				"Error finding vehicles"
			);
			return ServiceResponse.failure(
				"An error occurred while retrieving vehicles.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Get details of a vehicle by id, with latest telemetry log.
	 * USER: only their own.
	 * ADMIN: any.
	 */
	async findById(id: number, accessToken?: string) {
		logger.debug(
			{ id, where: "VehicleService.findById" },
			"Find vehicle by id request"
		);

		const user = this.extractUser(accessToken);
		if (!user) {
			return ServiceResponse.failure(
				"Missing or invalid access token.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}

		try {
			const vehicle = await this.repo.findById(id);
			if (!vehicle) {
				logger.debug(
					{ id, where: "VehicleService.findById" },
					"Vehicle not found"
				);
				return ServiceResponse.failure(
					"Vehicle not found.",
					null,
					StatusCodes.NOT_FOUND
				);
			}
			if (!this.isAllowed(user, vehicle.user_id)) {
				return ServiceResponse.failure(
					"Unauthorized to access this vehicle.",
					null,
					StatusCodes.FORBIDDEN
				);
			}
			const latestTelemetry = await this.telemetryRepo.getLatestTelemetryLog(
				vehicle.id
			);
			return ServiceResponse.success("Vehicle found.", {
				...vehicle.toJSON(),
				latestTelemetry: latestTelemetry ? latestTelemetry.toJSON() : null,
			});
		} catch (ex) {
			logger.error(
				{ error: (ex as Error).message, id, where: "VehicleService.findById" },
				"Error finding vehicle"
			);
			return ServiceResponse.failure(
				"An error occurred while finding vehicle.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * GET /vehicles - List vehicles with status and latest speed
	 */
	async findAllLatestSummary(
		opts: {
			search?: string;
			status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
			page?: number;
			limit?: number;
		},
		accessToken?: string
	) {
		const user = this.extractUser(accessToken);
		if (!user) {
			return ServiceResponse.failure(
				"Missing or invalid access token.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}
		try {
			const repoOpts = { ...opts };
			if (user.role !== "ADMIN") {
				(repoOpts as any).user_id = user.id;
			}
			const { rows } = await this.repo.findVehicles(repoOpts);
			const data = await Promise.all(
				rows.map(async (v) => {
					const latestTelemetry =
						await this.telemetryRepo.getLatestTelemetryLog(v.id);
					return {
						id: v.id,
						name: v.name,
						status: v.status,
						speed:
							latestTelemetry && latestTelemetry.data
								? (latestTelemetry.data as any).speed ?? null
								: null,
						updated_at: v.updated_at?.toISOString() ?? null,
					};
				})
			);
			return {
				statusCode: 200,
				responseObject: data,
			};
		} catch (ex) {
			logger.error(
				{
					error: (ex as Error).message,
					where: "VehicleService.findAllLatestSummary",
				},
				"Error in findAllLatestSummary"
			);
			return ServiceResponse.failure(
				"An error occurred while retrieving vehicles.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * GET /vehicles/:id - Get latest telemetry log, flattened.
	 */
	async getLatestTelemetryFlattened(id: number, accessToken?: string) {
		const user = this.extractUser(accessToken);
		if (!user) {
			return ServiceResponse.failure(
				"Missing or invalid access token.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}
		try {
			const vehicle = await this.repo.findById(id);
			if (!vehicle) {
				return {
					statusCode: 404,
					message: "Vehicle not found.",
					responseObject: null,
				};
			}
			if (!this.isAllowed(user, vehicle.user_id)) {
				return {
					statusCode: 403,
					message: "Unauthorized to access this vehicle.",
					responseObject: null,
				};
			}
			const latestTelemetry = await this.telemetryRepo.getLatestTelemetryLog(
				id
			);
			if (!latestTelemetry || !latestTelemetry.data) {
				return {
					statusCode: 404,
					message: "No telemetry data found.",
					responseObject: null,
				};
			}
			const { odometer, fuel_level, speed, lat, lon } =
				latestTelemetry.data as any;
			return {
				statusCode: 200,
				responseObject: {
					vehicleId: id,
					odometer: odometer ?? null,
					fuel_level: fuel_level ?? null,
					timestamp: latestTelemetry.timestamp?.toISOString() ?? null,
					latitude: lat ?? null,
					longitude: lon ?? null,
					speed: speed ?? null,
				},
			};
		} catch (ex) {
			logger.error(
				{
					error: (ex as Error).message,
					id,
					where: "VehicleService.getLatestTelemetryFlattened",
				},
				"Error in getLatestTelemetryFlattened"
			);
			return ServiceResponse.failure(
				"An error occurred while retrieving telemetry.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Update vehicle details, including license_plate uniqueness check if needed.
	 * USER: only their own. Cannot change user_id.
	 * ADMIN: can update any, including user_id.
	 */
	async update(
		id: number,
		data: {
			name?: string;
			license_plate?: string;
			model?: string | null;
			status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
			user_id?: number;
		},
		accessToken?: string
	) {
		logger.debug(
			{ id, data, where: "VehicleService.update" },
			"Update vehicle request"
		);

		const user = this.extractUser(accessToken);
		if (!user) {
			return ServiceResponse.failure(
				"Missing or invalid access token.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}

		try {
			const vehicle = await this.repo.findById(id);
			if (!vehicle) {
				logger.debug(
					{ id, where: "VehicleService.update" },
					"Vehicle not found"
				);
				return ServiceResponse.failure(
					"Vehicle not found.",
					null,
					StatusCodes.NOT_FOUND
				);
			}
			if (!this.isAllowed(user, vehicle.user_id)) {
				return ServiceResponse.failure(
					"Unauthorized to update this vehicle.",
					null,
					StatusCodes.FORBIDDEN
				);
			}
			// Only ADMIN can change user_id
			let updateData = { ...data };
			if (user.role !== "ADMIN") {
				delete updateData.user_id;
			}

			if (
				updateData.license_plate &&
				updateData.license_plate !== vehicle.license_plate
			) {
				const exists = await this.repo.findByLicensePlate(
					updateData.license_plate
				);
				if (exists && exists.id !== id) {
					logger.debug(
						{
							license_plate: updateData.license_plate,
							where: "VehicleService.update",
						},
						"License plate already in use"
					);
					return ServiceResponse.failure(
						"License plate already in use.",
						null,
						StatusCodes.CONFLICT
					);
				}
			}
			const updated = await this.repo.updateVehicle(id, updateData);
			logger.debug({ id, where: "VehicleService.update" }, "Vehicle updated");
			return ServiceResponse.success("Vehicle updated.", updated?.toJSON());
		} catch (ex) {
			logger.error(
				{ error: (ex as Error).message, id, where: "VehicleService.update" },
				"Error updating vehicle"
			);
			return ServiceResponse.failure(
				"An error occurred while updating vehicle.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Soft delete (paranoid) a vehicle by id.
	 * USER: only their own.
	 * ADMIN: any.
	 */
	async delete(id: number, accessToken?: string) {
		logger.debug(
			{ id, where: "VehicleService.delete" },
			"Delete vehicle request"
		);

		const user = this.extractUser(accessToken);
		if (!user) {
			return ServiceResponse.failure(
				"Missing or invalid access token.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}

		try {
			const vehicle = await this.repo.findById(id);
			if (!vehicle) {
				logger.debug(
					{ id, where: "VehicleService.delete" },
					"Vehicle not found"
				);
				return ServiceResponse.failure(
					"Vehicle not found.",
					null,
					StatusCodes.NOT_FOUND
				);
			}
			if (!this.isAllowed(user, vehicle.user_id)) {
				return ServiceResponse.failure(
					"Unauthorized to delete this vehicle.",
					null,
					StatusCodes.FORBIDDEN
				);
			}
			const deleted = await this.repo.softDeleteVehicle(id);
			logger.debug(
				{ id, deleted, where: "VehicleService.delete" },
				"Vehicle deleted"
			);
			return ServiceResponse.success(
				"Vehicle deleted.",
				null,
				StatusCodes.NO_CONTENT
			);
		} catch (ex) {
			logger.error(
				{ error: (ex as Error).message, id, where: "VehicleService.delete" },
				"Error deleting vehicle"
			);
			return ServiceResponse.failure(
				"An error occurred while deleting vehicle.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}
}

export const vehicleService = new VehicleService();
