import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";
import { logger } from "@/server";

/**
 * Controller for Vehicle API endpoints.
 * Handles input parsing, accessToken extraction, calls the service, and sends formatted responses.
 * user_id is always injected by backend from accessToken, not from the input.
 */
class VehicleController {
	/**
	 * POST /vehicles - Create a new vehicle (user_id from accessToken)
	 */
	createVehicle = async (req: Request, res: Response) => {
		const { name, license_plate, model, status } = req.body;
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "CreateVehicle",
				endpoint: req.originalUrl,
				method: req.method,
				headers: req.headers,
				body: req.body,
				query: req.query,
				params: req.params,
			},
			"Create vehicle request received"
		);
		const result = await vehicleService.create(
			{ name, license_plate, model, status },
			accessToken
		);
		logger.debug(
			{
				event: "CreateVehicle",
				result,
				endpoint: req.originalUrl,
			},
			"Create vehicle result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /vehicles - Get paginated, filtered list of vehicles (with latest telemetry).
	 * Only returns vehicles belonging to the user if USER role.
	 */
	getVehicles = async (req: Request, res: Response) => {
		const { search, status, page, limit } = req.query;
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "GetVehicles",
				endpoint: req.originalUrl,
				method: req.method,
				headers: req.headers,
				body: req.body,
				query: req.query,
				params: req.params,
			},
			"Get vehicles request received"
		);
		const result = await vehicleService.findAll(
			{
				search: search as string | undefined,
				status: status as "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined,
				page: page ? Number(page) : undefined,
				limit: limit ? Number(limit) : undefined,
			},
			accessToken
		);
		logger.debug(
			{
				event: "GetVehicles",
				result,
				endpoint: req.originalUrl,
			},
			"Get vehicles result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /vehicles/:id - Get details of a specific vehicle (with latest telemetry).
	 * Only returns vehicle if owned by user or ADMIN.
	 */
	getVehicleById = async (req: Request, res: Response) => {
		const id = Number(req.params.id);
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "GetVehicleById",
				endpoint: req.originalUrl,
				method: req.method,
				headers: req.headers,
				body: req.body,
				query: req.query,
				params: req.params,
				id,
			},
			"Get vehicle by id request received"
		);
		const result = await vehicleService.findById(id, accessToken);
		logger.debug(
			{
				event: "GetVehicleById",
				result,
				endpoint: req.originalUrl,
				id,
			},
			"Get vehicle by id result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /vehicles - List vehicles with latest speed/status
	 */
	getVehiclesLatestSummary = async (req: Request, res: Response) => {
		const { search, status, page, limit } = req.query;
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "GetVehiclesLatestSummary",
				endpoint: req.originalUrl,
				method: req.method,
				headers: req.headers,
				query: req.query,
			},
			"Get vehicles latest summary request received"
		);
		const result = await vehicleService.findAllLatestSummary(
			{
				search: search as string | undefined,
				status: status as "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined,
				page: page ? Number(page) : undefined,
				limit: limit ? Number(limit) : undefined,
			},
			accessToken
		);
		res.status(result.statusCode).json(result.responseObject);
	};

	/**
	 * GET /vehicles/:id - Get latest telemetry log, flattened.
	 */
	getVehicleLatestTelemetry = async (req: Request, res: Response) => {
		const id = Number(req.params.id);
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "GetVehicleLatestTelemetry",
				endpoint: req.originalUrl,
				method: req.method,
				headers: req.headers,
				params: req.params,
				id,
			},
			"Get vehicle latest telemetry request received"
		);
		const result = await vehicleService.getLatestTelemetryFlattened(
			id,
			accessToken
		);
		if (result.statusCode === 404) {
			res.status(404).json({ message: result.message });
		} else {
			res.status(result.statusCode).json(result.responseObject);
		}
	};

	/**
	 * PATCH /vehicles/:id - Update a vehicle's details.
	 * Only ADMIN or owner can update. user_id is not allowed from client.
	 */
	updateVehicle = async (req: Request, res: Response) => {
		const id = Number(req.params.id);
		const { name, license_plate, model, status } = req.body;
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "UpdateVehicle",
				endpoint: req.originalUrl,
				method: req.method,
				headers: req.headers,
				body: req.body,
				query: req.query,
				params: req.params,
				id,
			},
			"Update vehicle request received"
		);
		const result = await vehicleService.update(
			id,
			{ name, license_plate, model, status },
			accessToken
		);
		logger.debug(
			{
				event: "UpdateVehicle",
				result,
				endpoint: req.originalUrl,
				id,
			},
			"Update vehicle result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * DELETE /vehicles/:id - Soft delete a vehicle.
	 * Only ADMIN or owner can delete.
	 */
	deleteVehicle = async (req: Request, res: Response) => {
		const id = Number(req.params.id);
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "DeleteVehicle",
				endpoint: req.originalUrl,
				method: req.method,
				headers: req.headers,
				body: req.body,
				query: req.query,
				params: req.params,
				id,
			},
			"Delete vehicle request received"
		);
		const result = await vehicleService.delete(id, accessToken);
		logger.debug(
			{
				event: "DeleteVehicle",
				result,
				endpoint: req.originalUrl,
				id,
			},
			"Delete vehicle result"
		);
		res.status(result.statusCode).json(result);
	};
}

export const vehicleController = new VehicleController();
