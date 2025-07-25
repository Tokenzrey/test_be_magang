import { Request, Response } from "express";
import { telementryLogService } from "./telementryLog.service";
import { logger } from "@/server";

/**
 * Controller for TelemetryLog API endpoints.
 * CRUD is restricted to logs for vehicles owned by the user's user_id (except ADMIN).
 * Includes stats and latest log features.
 */
class TelementryLogController {
	/**
	 * POST /vehicles/:id/telemetry - Create a telemetry log for a vehicle.
	 */
	createTelemetryLog = async (req: Request, res: Response) => {
		const vehicle_id = Number(req.params.id);
		const { timestamp, data } = req.body;
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "CreateTelemetryLog",
				endpoint: req.originalUrl,
				vehicle_id,
				body: req.body,
			},
			"Create telemetry log request received"
		);
		const result = await telementryLogService.createTelemetryLog(
			{ vehicle_id, timestamp, data },
			accessToken
		);
		logger.debug(
			{
				event: "CreateTelemetryLog",
				result,
				endpoint: req.originalUrl,
				vehicle_id,
			},
			"Create telemetry log result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /vehicles/:id/telemetry - Get all telemetry logs for a vehicle (paginated).
	 */
	getTelemetryLogsForVehicle = async (req: Request, res: Response) => {
		const vehicle_id = Number(req.params.id);
		const { from, to, page, limit } = req.query;
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "GetTelemetryLogsForVehicle",
				endpoint: req.originalUrl,
				vehicle_id,
				query: req.query,
			},
			"Get telemetry logs for vehicle request received"
		);
		const result = await telementryLogService.getTelemetryLogsForVehicle(
			{
				vehicle_id,
				from: from ? new Date(from as string) : undefined,
				to: to ? new Date(to as string) : undefined,
				page: page ? Number(page) : undefined,
				limit: limit ? Number(limit) : undefined,
			},
			accessToken
		);
		logger.debug(
			{
				event: "GetTelemetryLogsForVehicle",
				result,
				endpoint: req.originalUrl,
				vehicle_id,
			},
			"Get telemetry logs for vehicle result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /vehicles/:id/telemetry/all - Get ALL telemetry logs for a vehicle (no pagination).
	 */
	getAllTelemetryLogsForVehicle = async (req: Request, res: Response) => {
		const vehicle_id = Number(req.params.id);
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "GetAllTelemetryLogsForVehicle",
				endpoint: req.originalUrl,
				vehicle_id,
			},
			"Get ALL telemetry logs for vehicle request received"
		);
		const result = await telementryLogService.getAllTelemetryLogsForVehicle(
			vehicle_id,
			accessToken
		);
		logger.debug(
			{
				event: "GetAllTelemetryLogsForVehicle",
				result,
				endpoint: req.originalUrl,
				vehicle_id,
			},
			"Get ALL telemetry logs for vehicle result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /vehicles/:id/telemetry/latest - Get latest telemetry log for a vehicle.
	 */
	getLatestTelemetryLogForVehicle = async (req: Request, res: Response) => {
		const vehicle_id = Number(req.params.id);
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "GetLatestTelemetryLogForVehicle",
				endpoint: req.originalUrl,
				vehicle_id,
			},
			"Get latest telemetry log for vehicle request received"
		);
		const result = await telementryLogService.getLatestTelemetryLogForVehicle(
			vehicle_id,
			accessToken
		);
		logger.debug(
			{
				event: "GetLatestTelemetryLogForVehicle",
				result,
				endpoint: req.originalUrl,
				vehicle_id,
			},
			"Get latest telemetry log for vehicle result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /vehicles/telemetry/latest - Get latest telemetry log for all owned vehicles
	 */
	getAllLatestTelemetryLogsForOwnedVehicles = async (
		req: Request,
		res: Response
	) => {
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "GetAllLatestTelemetryLogsForOwnedVehicles",
				endpoint: req.originalUrl,
				headers: req.headers,
			},
			"Get ALL latest telemetry logs for owned vehicles request received"
		);
		const result =
			await telementryLogService.getAllLatestTelemetryLogsForOwnedVehicles(
				accessToken
			);
		logger.debug(
			{
				event: "GetAllLatestTelemetryLogsForOwnedVehicles",
				result,
				endpoint: req.originalUrl,
			},
			"Get ALL latest telemetry logs for owned vehicles result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /telementry/stats - Get statistics for vehicles (for user or admin).
	 */
	getVehicleStats = async (req: Request, res: Response) => {
		logger.debug(
			{
				event: "GetVehicleStats",
			},
			"Get vehicle stats request received"
		);

		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);

		const result = await telementryLogService.getVehicleStats(
			accessToken || ""
		);
		logger.debug(
			{
				event: "GetVehicleStats",
				result,
			},
			"Get vehicle stats result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * GET /telementry/:logId - Get telemetry log by id.
	 */
	getTelemetryLogById = async (req: Request, res: Response) => {
		const id = Number(req.params.logId);
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{ event: "GetTelemetryLogById", endpoint: req.originalUrl, id },
			"Get telemetry log by id request received"
		);
		const result = await telementryLogService.getTelemetryLogById(
			id,
			accessToken
		);
		logger.debug(
			{ event: "GetTelemetryLogById", result, endpoint: req.originalUrl, id },
			"Get telemetry log by id result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * PATCH /telementry/:logId - Update telemetry log by id.
	 */
	updateTelemetryLog = async (req: Request, res: Response) => {
		const id = Number(req.params.logId);
		const { timestamp, data } = req.body;
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{
				event: "UpdateTelemetryLog",
				endpoint: req.originalUrl,
				id,
				body: req.body,
			},
			"Update telemetry log request received"
		);
		const result = await telementryLogService.updateTelemetryLog(
			id,
			{ timestamp, data },
			accessToken
		);
		logger.debug(
			{ event: "UpdateTelemetryLog", result, endpoint: req.originalUrl, id },
			"Update telemetry log result"
		);
		res.status(result.statusCode).json(result);
	};

	/**
	 * DELETE /telementry/:logId - Delete telemetry log by id.
	 */
	deleteTelemetryLog = async (req: Request, res: Response) => {
		const id = Number(req.params.logId);
		const accessToken = (req.headers["authorization"] as string)?.replace(
			/^Bearer\s+/i,
			""
		);
		logger.debug(
			{ event: "DeleteTelemetryLog", endpoint: req.originalUrl, id },
			"Delete telemetry log request received"
		);
		const result = await telementryLogService.deleteTelemetryLog(
			id,
			accessToken
		);
		logger.debug(
			{ event: "DeleteTelemetryLog", result, endpoint: req.originalUrl, id },
			"Delete telemetry log result"
		);
		res.status(result.statusCode).json(result);
	};
}

export const telementryLogController = new TelementryLogController();
