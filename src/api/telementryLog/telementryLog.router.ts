/**
 * TelemetryLog Router - API endpoints for vehicle telemetry logs.
 * Includes CRUD, stats, latest and all logs endpoints.
 * OpenAPI/Swagger registration for all endpoints and schemas.
 */

import express, { Router } from "express";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { telementryLogController } from "./telementryLog.controller";
import { authenticateToken } from "@/common/middleware/authenticateToken.middleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import {
	CreateTelemetryLogSchema,
	TelemetryLogSchema,
	TelemetryLogQuerySchema,
} from "./telementryLog.model";
import { z } from "zod";

export const telementryLogRegistry = new OpenAPIRegistry();
export const telementryLogRouter: Router = express.Router();

/**
 * Register TelemetryLog schemas for OpenAPI.
 */
telementryLogRegistry.register("TelemetryLog", TelemetryLogSchema);
telementryLogRegistry.register("CreateTelemetryLog", CreateTelemetryLogSchema);

/*
 * NOTE: Order matters! More specific routes go first, then the less specific ones.
 * Avoids route conflicts and ambiguity.
 */

/**
 * GET /latest/vehicles - Get latest telemetry log for all vehicles owned by requester (USER: own, ADMIN: all)
 */
telementryLogRegistry.registerPath({
	method: "get",
	path: "/latest/vehicles",
	tags: ["TelemetryLog"],
	request: {
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		200: {
			description:
				"Latest telemetry logs for all vehicles owned by user (or all for ADMIN)",
			content: {
				"application/json": {
					schema: z.array(
						z.object({
							vehicle_id: z.number(),
							log: TelemetryLogSchema.nullable(),
						})
					),
				},
			},
		},
		403: { description: "Forbidden" },
	},
});
telementryLogRouter.get(
	"/latest/vehicles",
	authenticateToken,
	telementryLogController.getAllLatestTelemetryLogsForOwnedVehicles
);

/**
 * GET /stats - Get vehicle stats for current user (or all if admin)
 */
telementryLogRegistry.registerPath({
	method: "get",
	path: "/stats",
	tags: ["TelemetryLog"],
	request: {
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		200: {
			description: "Vehicle stats found",
			content: {
				"application/json": {
					schema: z.object({
						total: z.number().openapi({
							description: "Total vehicles owned by user (or all for admin)",
						}),
						parked: z
							.number()
							.openapi({ description: "Parked vehicles (ACTIVE, speed=0)" }),
						moving: z
							.number()
							.openapi({ description: "Moving vehicles (ACTIVE, speed>0)" }),
						maintenance: z
							.number()
							.openapi({ description: "Vehicles in maintenance" }),
					}),
				},
			},
		},
		403: { description: "Forbidden" },
	},
});
telementryLogRouter.get(
	"/stats",
	authenticateToken,
	telementryLogController.getVehicleStats
);

/**
 * POST /:id/vehicles - Create telemetry log for a vehicle
 */
telementryLogRegistry.registerPath({
	method: "post",
	path: "/{id}/vehicles",
	tags: ["TelemetryLog"],
	request: {
		params: z.object({ id: z.coerce.number().int().min(1) }),
		body: {
			content: {
				"application/json": { schema: CreateTelemetryLogSchema },
			},
		},
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		201: {
			description: "Telemetry log created",
			content: { "application/json": { schema: TelemetryLogSchema } },
		},
		403: {
			description: "Forbidden",
		},
		404: {
			description: "Vehicle not found",
		},
	},
});
telementryLogRouter.post(
	"/:id/vehicles",
	authenticateToken,
	validateRequest(CreateTelemetryLogSchema),
	telementryLogController.createTelemetryLog
);

/**
 * GET /:id/vehicles/latest - Get latest telemetry log for a vehicle
 */
telementryLogRegistry.registerPath({
	method: "get",
	path: "/{id}/vehicles/latest",
	tags: ["TelemetryLog"],
	request: {
		params: z.object({ id: z.coerce.number().int().min(1) }),
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		200: {
			description: "Latest telemetry log found",
			content: {
				"application/json": { schema: TelemetryLogSchema.nullable() },
			},
		},
		403: { description: "Forbidden" },
		404: { description: "Vehicle not found" },
	},
});
telementryLogRouter.get(
	"/:id/vehicles/latest",
	authenticateToken,
	telementryLogController.getLatestTelemetryLogForVehicle
);

/**
 * GET /:id/vehicles/all - Get all telemetry logs for a vehicle (no pagination)
 */
telementryLogRegistry.registerPath({
	method: "get",
	path: "/{id}/vehicles/all",
	tags: ["TelemetryLog"],
	request: {
		params: z.object({ id: z.coerce.number().int().min(1) }),
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		200: {
			description: "All telemetry logs found",
			content: { "application/json": { schema: z.array(TelemetryLogSchema) } },
		},
		403: { description: "Forbidden" },
		404: { description: "Vehicle not found" },
	},
});
telementryLogRouter.get(
	"/:id/vehicles/all",
	authenticateToken,
	telementryLogController.getAllTelemetryLogsForVehicle
);

/**
 * GET /:id/vehicles - Get paginated telemetry logs for a vehicle
 */
telementryLogRegistry.registerPath({
	method: "get",
	path: "/{id}/vehicles",
	tags: ["TelemetryLog"],
	request: {
		params: z.object({ id: z.coerce.number().int().min(1) }),
		query: TelemetryLogQuerySchema,
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		200: {
			description: "Telemetry logs found (paginated)",
			content: {
				"application/json": {
					schema: z.object({
						data: z.array(TelemetryLogSchema),
						pagination: z.object({
							total: z.number(),
							page: z.number(),
							limit: z.number(),
							pages: z.number(),
						}),
					}),
				},
			},
		},
		403: { description: "Forbidden" },
		404: { description: "Vehicle not found" },
	},
});
telementryLogRouter.get(
	"/:id/vehicles",
	authenticateToken,
	validateRequest(TelemetryLogQuerySchema, "query"),
	telementryLogController.getTelemetryLogsForVehicle
);

/**
 * GET /:logId - Get telemetry log by id
 */
telementryLogRegistry.registerPath({
	method: "get",
	path: "/{logId}",
	tags: ["TelemetryLog"],
	request: {
		params: z.object({ logId: z.coerce.number().int().min(1) }),
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		200: {
			description: "Telemetry log found",
			content: { "application/json": { schema: TelemetryLogSchema } },
		},
		403: { description: "Forbidden" },
		404: { description: "Telemetry log not found" },
	},
});
telementryLogRouter.get(
	"/:logId",
	authenticateToken,
	telementryLogController.getTelemetryLogById
);

/**
 * PATCH /:logId - Update telemetry log by id
 */
telementryLogRegistry.registerPath({
	method: "patch",
	path: "/{logId}",
	tags: ["TelemetryLog"],
	request: {
		params: z.object({ logId: z.coerce.number().int().min(1) }),
		body: {
			content: {
				"application/json": { schema: CreateTelemetryLogSchema.partial() },
			},
		},
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		200: {
			description: "Telemetry log updated",
			content: { "application/json": { schema: TelemetryLogSchema } },
		},
		403: { description: "Forbidden" },
		404: { description: "Telemetry log not found" },
	},
});
telementryLogRouter.patch(
	"/:logId",
	authenticateToken,
	validateRequest(CreateTelemetryLogSchema.partial()),
	telementryLogController.updateTelemetryLog
);

/**
 * DELETE /:logId - Delete telemetry log by id
 */
telementryLogRegistry.registerPath({
	method: "delete",
	path: "/{logId}",
	tags: ["TelemetryLog"],
	request: {
		params: z.object({ logId: z.coerce.number().int().min(1) }),
		headers: z.object({
			authorization: z.string().openapi({ example: "Bearer <token>" }),
		}),
	},
	responses: {
		200: { description: "Telemetry log deleted" },
		403: { description: "Forbidden" },
		404: { description: "Telemetry log not found" },
	},
});
telementryLogRouter.delete(
	"/:logId",
	authenticateToken,
	telementryLogController.deleteTelemetryLog
);
