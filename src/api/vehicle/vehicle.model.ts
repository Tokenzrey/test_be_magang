/**
 * Vehicle API schema definition for validation and typing (not ORM).
 * This schema is used for request body validation and OpenAPI documentation.
 */

import { z } from "zod";

/**
 * Enum for vehicle status.
 */
export const VehicleStatusEnum = z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]);

/**
 * Vehicle API schema (full object as returned in API).
 */
export const VehicleSchema = z.object({
	id: z.number(),
	name: z.string(),
	license_plate: z.string(),
	model: z.string().nullable().optional(),
	status: VehicleStatusEnum,
	user_id: z.number(), // user_id is always returned from backend
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
	deleted_at: z.string().datetime().nullable().optional(),
});

/**
 * Vehicle creation schema (input for POST).
 * Note: user_id is NOT present in the input body, it is injected from accessToken by the backend.
 */
export const CreateVehicleSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters long."),
	license_plate: z.string().min(1, "License plate is required."),
	model: z.string().optional(),
	status: VehicleStatusEnum.optional(),
});

/**
 * Vehicle update schema (input for PATCH).
 * Note: user_id is NOT present in the input body, it is injected from accessToken by the backend.
 */
export const UpdateVehicleSchema = z.object({
	name: z.string().min(3).optional(),
	license_plate: z.string().min(1).optional(),
	model: z.string().optional(),
	status: VehicleStatusEnum.optional(),
});

/**
 * Vehicle query params schema (for GET /vehicles).
 */
export const VehicleQuerySchema = z.object({
	search: z.string().optional(),
	status: VehicleStatusEnum.optional(),
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).optional(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;
