/**
 * TelemetryLogService - Business logic for TelemetryLogs.
 * Includes stats and latest log data features.
 */

import { telementryLogRepository } from "./telementryLog.repository";
import type {
	TelemetryLogCreationAttributes,
	TelemetryLogAttributes,
} from "@/common/db/models/telementryLog";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "@/common/utils/jwtToken";
import Vehicle from "@/common/db/models/vehicle";

class TelementryLogService {
	/**
	 * Create a new telemetry log.
	 */
	async createTelemetryLog(
		data: TelemetryLogCreationAttributes,
		accessToken: string
	) {
		try {
			const user = verifyAccessToken(accessToken);
			// Only allow log creation for owned vehicle (unless ADMIN)
			const vehicle = await Vehicle.findByPk(data.vehicle_id);
			if (!vehicle)
				return ServiceResponse.failure("Vehicle not found", null, 404);
			if (user.role !== "ADMIN" && vehicle.user_id !== user.id)
				return ServiceResponse.failure(
					"Forbidden: You do not own this vehicle",
					null,
					403
				);
			const log = await telementryLogRepository.createTelemetryLog(data);
			return ServiceResponse.success("Telemetry log created", log, 201);
		} catch (e) {
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Get all telemetry logs for a vehicle (paginated).
	 */
	async getTelemetryLogsForVehicle(
		query: {
			vehicle_id: number;
			from?: Date;
			to?: Date;
			page?: number;
			limit?: number;
		},
		accessToken: string
	) {
		try {
			const { vehicle_id, from, to, page, limit } = query;
			const user = verifyAccessToken(accessToken);
			const vehicle = await Vehicle.findByPk(vehicle_id);
			if (!vehicle)
				return ServiceResponse.failure("Vehicle not found", null, 404);
			if (user.role !== "ADMIN" && vehicle.user_id !== user.id)
				return ServiceResponse.failure(
					"Forbidden: You do not own this vehicle",
					null,
					403
				);
			const { rows, count } =
				await telementryLogRepository.getTelemetryLogsForVehicle({
					vehicle_id,
					from,
					to,
					page,
					limit,
				});
			return ServiceResponse.success("Telemetry logs found", {
				data: rows,
				pagination: {
					total: count,
					page: page || 1,
					limit: limit || 50,
					pages: Math.ceil(count / (limit || 50)),
				},
			});
		} catch (e) {
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Get ALL telemetry logs for a vehicle (no pagination).
	 */
	async getAllTelemetryLogsForVehicle(vehicle_id: number, accessToken: string) {
		try {
			const user = verifyAccessToken(accessToken);
			const vehicle = await Vehicle.findByPk(vehicle_id);
			if (!vehicle)
				return ServiceResponse.failure("Vehicle not found", null, 404);
			if (user.role !== "ADMIN" && vehicle.user_id !== user.id)
				return ServiceResponse.failure(
					"Forbidden: You do not own this vehicle",
					null,
					403
				);
			const logs = await telementryLogRepository.getAllTelemetryLogsForVehicle(
				vehicle_id
			);
			return ServiceResponse.success("All telemetry logs found", logs);
		} catch (e) {
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Get telemetry log by id.
	 */
	async getTelemetryLogById(id: number, accessToken: string) {
		try {
			const user = verifyAccessToken(accessToken);
			const log = await telementryLogRepository.findById(id);
			if (!log)
				return ServiceResponse.failure("Telemetry log not found", null, 404);
			const vehicle = await Vehicle.findByPk(log.vehicle_id);
			if (!vehicle)
				return ServiceResponse.failure("Vehicle not found", null, 404);
			if (user.role !== "ADMIN" && vehicle.user_id !== user.id)
				return ServiceResponse.failure(
					"Forbidden: You do not own this vehicle",
					null,
					403
				);
			return ServiceResponse.success("Telemetry log found", log);
		} catch (e) {
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Update telemetry log by id.
	 */
	async updateTelemetryLog(
		id: number,
		updates: Partial<TelemetryLogAttributes>,
		accessToken: string
	) {
		try {
			const user = verifyAccessToken(accessToken);
			const log = await telementryLogRepository.findById(id);
			if (!log)
				return ServiceResponse.failure("Telemetry log not found", null, 404);
			const vehicle = await Vehicle.findByPk(log.vehicle_id);
			if (!vehicle)
				return ServiceResponse.failure("Vehicle not found", null, 404);
			if (user.role !== "ADMIN" && vehicle.user_id !== user.id)
				return ServiceResponse.failure(
					"Forbidden: You do not own this vehicle",
					null,
					403
				);
			const updated = await telementryLogRepository.updateTelemetryLog(
				id,
				updates
			);
			return ServiceResponse.success("Telemetry log updated", updated);
		} catch (e) {
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Delete telemetry log by id.
	 */
	async deleteTelemetryLog(id: number, accessToken: string) {
		try {
			const user = verifyAccessToken(accessToken);
			const log = await telementryLogRepository.findById(id);
			if (!log)
				return ServiceResponse.failure("Telemetry log not found", null, 404);
			const vehicle = await Vehicle.findByPk(log.vehicle_id);
			if (!vehicle)
				return ServiceResponse.failure("Vehicle not found", null, 404);
			if (user.role !== "ADMIN" && vehicle.user_id !== user.id)
				return ServiceResponse.failure(
					"Forbidden: You do not own this vehicle",
					null,
					403
				);
			const deleted = await telementryLogRepository.deleteTelemetryLog(id);
			if (!deleted)
				return ServiceResponse.failure(
					"Failed to delete telemetry log",
					null,
					500
				);
			return ServiceResponse.success("Telemetry log deleted", null, 200);
		} catch (e) {
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Get statistics for vehicles: total, parked, moving, maintenance (only for vehicles owned by user).
	 * ADMIN gets stats for all vehicles.
	 * @param accessToken JWT access token from headers
	 */
	async getVehicleStats(accessToken: string) {
		try {
			const user = verifyAccessToken(accessToken);
			const isAdmin = user.role === "ADMIN";
			const stats = await telementryLogRepository.getVehicleStatsByUserId(
				user.id,
				isAdmin
			);
			return ServiceResponse.success("Vehicle stats found", stats);
		} catch (e) {
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Get latest telemetry log for a vehicle.
	 */
	async getLatestTelemetryLogForVehicle(
		vehicle_id: number,
		accessToken: string
	) {
		try {
			const user = verifyAccessToken(accessToken);
			const vehicle = await Vehicle.findByPk(vehicle_id);
			if (!vehicle)
				return ServiceResponse.failure("Vehicle not found", null, 404);
			if (user.role !== "ADMIN" && vehicle.user_id !== user.id)
				return ServiceResponse.failure(
					"Forbidden: You do not own this vehicle",
					null,
					403
				);
			const log = await telementryLogRepository.getLatestTelemetryLog(
				vehicle_id
			);
			return ServiceResponse.success("Latest telemetry log found", log);
		} catch (e) {
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Get latest telemetry logs for all vehicles owned by user (or all if ADMIN).
	 * Returns an array of { vehicle_id, log }.
	 */
	async getAllLatestTelemetryLogsForOwnedVehicles(accessToken: string) {
		try {
			const user = verifyAccessToken(accessToken);

			const where: any = { deleted_at: null };
			if (user.role !== "ADMIN") {
				where.user_id = user.id;
			}

			const vehicles = await Vehicle.findAll({ where, attributes: ["id"] });
			console.debug(
				"[getAllLatestTelemetryLogsForOwnedVehicles] raw vehicles:",
				vehicles
			);

			const vehicleIds = vehicles
				.map((v) => Number(v.id))
				.filter((id) => Number.isInteger(id) && id > 0);

			console.debug(
				"[getAllLatestTelemetryLogsForOwnedVehicles] vehicleIds after filter:",
				vehicleIds
			);

			if (vehicleIds.length === 0) {
				console.debug(
					"[getAllLatestTelemetryLogsForOwnedVehicles] No vehicles found for user."
				);
				return ServiceResponse.success(
					"Latest telemetry logs for all vehicles",
					[]
				);
			}

			const result =
				await telementryLogRepository.getLatestTelemetryLogsForVehicles(
					vehicleIds
				);

			const data = vehicleIds.map((id) => ({
				vehicle_id: id,
				log: result[id] || null,
			}));

			console.debug(
				"[getAllLatestTelemetryLogsForOwnedVehicles] output:",
				data
			);

			return ServiceResponse.success(
				"Latest telemetry logs for all vehicles",
				data
			);
		} catch (e) {
			console.error(
				"[getAllLatestTelemetryLogsForOwnedVehicles] ERROR:",
				(e as Error).message,
				e
			);
			return ServiceResponse.failure(
				(e as Error).message,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}
}

export const telementryLogService = new TelementryLogService();
