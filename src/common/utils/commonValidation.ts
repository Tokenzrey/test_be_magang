import { z } from "zod";

/**
 * Common validation schemas and helpers for request data.
 * Extend this object with more reusable validation logic as needed.
 */
export const commonValidations = {
	id: z
		.string()
		.refine((data) => !Number.isNaN(Number(data)), "ID must be a numeric value")
		.transform(Number)
		.refine((num) => num > 0, "ID must be a positive number"),

	// Email validation pattern
	email: z.string().email("Invalid email address"),

	// Password validation: min 8 chars, at least 1 letter and 1 number
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Za-z]/, "Password must contain letters")
		.regex(/\d/, "Password must contain numbers"),

	// Pagination
	page: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : 1))
		.refine((num) => !isNaN(num) && num > 0, "Page must be a positive number"),

	limit: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : 10))
		.refine((num) => !isNaN(num) && num > 0, "Limit must be a positive number"),

	// Optional sort order validation
	sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
};
