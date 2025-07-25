/**
 * TelemetryLog API schema definition for validation and typing (not ORM).
 * This schema is used for request/response validation and OpenAPI documentation.
 */

import { z } from "zod";

/**
 * Schema for the `data` field inside telemetry log.
 */
export const TelemetryLogDataSchema = z.object({
	odometer: z.number().min(0, "Odometer must be >= 0"), // in kilometers or miles
	fuel_level: z.number().min(0).max(100), // percentage 0-100
	speed: z.number().min(0), // in km/h or mph
	lat: z.number().min(-90).max(90), // latitude
	lon: z.number().min(-180).max(180), // longitude
});

/**
 * TelemetryLog API schema (full object as returned in API).
 */
export const TelemetryLogSchema = z.object({
	id: z.number(),
	vehicle_id: z.number(),
	timestamp: z.string().datetime(),
	data: TelemetryLogDataSchema,
});

/**
 * TelemetryLog creation schema (input for POST if exposed).
 */
export const CreateTelemetryLogSchema = z.object({
	vehicle_id: z.number(),
	timestamp: z.string().datetime().optional(), // If not provided, backend can default to now
	data: TelemetryLogDataSchema,
});

/**
 * TelemetryLog query params schema (if needed).
 */
export const TelemetryLogQuerySchema = z.object({
	vehicle_id: z.number().optional(),
	from: z.string().datetime().optional(),
	to: z.string().datetime().optional(),
	limit: z.coerce.number().int().min(1).optional(),
	page: z.coerce.number().int().min(1).optional(),
});

export type TelemetryLog = z.infer<typeof TelemetryLogSchema>;
export type CreateTelemetryLogDto = z.infer<typeof CreateTelemetryLogSchema>;
export type TelemetryLogData = z.infer<typeof TelemetryLogDataSchema>;
