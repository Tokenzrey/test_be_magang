import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateRequest } from "@/common/utils/httpHandlers";
import { VehicleSchema, VehicleQuerySchema } from "./vehicle.model";
import { vehicleController } from "./vehicle.controller";
import { authenticateToken } from "@/common/middleware/authenticateToken.middleware";
import { authorizeRole } from "@/common/middleware/authorizeRole.middleware";

export const vehicleRegistry = new OpenAPIRegistry();
export const vehicleRouter: Router = express.Router();

// --- Debug Middleware (logs full request/response cycle) ---
function debugRequest(req: Request, res: Response, next: NextFunction) {
	console.debug(`[DEBUG][${req.method}] ${req.originalUrl}`);
	console.debug("Headers:", JSON.stringify(req.headers, null, 2));
	console.debug("Body:", JSON.stringify(req.body, null, 2));
	console.debug("Query:", JSON.stringify(req.query, null, 2));
	console.debug("Params:", JSON.stringify(req.params, null, 2));
	next();
}
function debugResponse(req: Request, res: Response, next: NextFunction) {
	const originalSend = res.send;
	res.send = function (body) {
		console.debug(`[DEBUG][Response][${req.method}] ${req.originalUrl}`);
		console.debug("Status:", res.statusCode);
		console.debug(
			"Response Body:",
			typeof body === "string" ? body : JSON.stringify(body, null, 2)
		);
		return originalSend.call(this, body);
	};
	next();
}
vehicleRouter.use(debugRequest, debugResponse);

// --- OpenAPI Registry for new custom responses ---
vehicleRegistry.registerPath({
	method: "get",
	path: "/vehicles",
	tags: ["Vehicle"],
	request: {
		query: VehicleQuerySchema,
	},
	// Custom response: array of { id, name, status, speed, updated_at }
	responses: {
		200: {
			description: "List of vehicles with latest speed.",
			content: {
				"application/json": {
					schema: z.array(
						z.object({
							id: z.number(),
							name: z.string(),
							status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]),
							speed: z.number().nullable(),
							updated_at: z.string(),
						})
					),
				},
			},
		},
	},
});

vehicleRegistry.registerPath({
	method: "get",
	path: "/vehicles/{id}",
	tags: ["Vehicle"],
	request: { params: z.object({ id: z.coerce.number().int().min(1) }) },
	// Custom response: details from latest telemetry
	responses: {
		200: {
			description: "Latest telemetry of a vehicle (flattened).",
			content: {
				"application/json": {
					schema: z.object({
						vehicleId: z.number(),
						odometer: z.number().nullable(),
						fuel_level: z.number().nullable(),
						timestamp: z.string().nullable(),
						latitude: z.number().nullable(),
						longitude: z.number().nullable(),
						speed: z.number().nullable(),
					}),
				},
			},
		},
		404: { description: "Vehicle or telemetry log not found" },
	},
});

// --- Express Routes ---

// POST /vehicles - Create a new vehicle
vehicleRouter.post(
	"/",
	authenticateToken,
	validateRequest(z.any()), // Validasi bisa disesuaikan dengan CreateVehicleSchema jika ingin lebih ketat
	vehicleController.createVehicle
);

// GET /vehicles - List vehicles (with latest summary)
vehicleRouter.get(
	"/",
	authenticateToken,
	validateRequest(VehicleQuerySchema, "query"),
	vehicleController.getVehiclesLatestSummary
);

// GET /vehicles/:id - Get latest telemetry log (flattened)
vehicleRouter.get(
	"/:id",
	authenticateToken,
	validateRequest(z.object({ id: z.coerce.number().int().min(1) }), "params"),
	vehicleController.getVehicleLatestTelemetry
);

// GET /vehicles - Get paginated, filtered list of vehicles (with latest telemetry)
vehicleRouter.get(
	"/all",
	authenticateToken,
	validateRequest(VehicleQuerySchema, "query"),
	vehicleController.getVehicles
);

// GET /vehicles/:id - Get details of a specific vehicle (with latest telemetry)
vehicleRouter.get(
	"/detail/:id",
	authenticateToken,
	validateRequest(z.object({ id: z.coerce.number().int().min(1) }), "params"),
	vehicleController.getVehicleById
);

// PATCH /vehicles/:id - Update a vehicle's details
vehicleRouter.patch(
	"/:id",
	authenticateToken,
	validateRequest(z.any()), // Validasi bisa disesuaikan dengan UpdateVehicleSchema jika ingin lebih ketat
	vehicleController.updateVehicle
);

// DELETE /vehicles/:id - Soft delete a vehicle
vehicleRouter.delete(
	"/:id",
	authenticateToken,
	vehicleController.deleteVehicle
);
