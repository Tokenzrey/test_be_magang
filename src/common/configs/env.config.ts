import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Environment configuration schema using Zod.
 * Validates and parses environment variables for the application.
 */
const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),

	HOST: z.string().min(1).default("localhost"),

	PORT: z.coerce.number().int().positive().default(8080),

	CORS_ORIGIN: z.string().url().default("http://localhost:8080"),

	COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce
		.number()
		.int()
		.positive()
		.default(1000),

	COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

	// Database configs
	DB_NAME: z.string().min(1).default("express_auth_db"),
	DB_USER: z.string().min(1).default("root"),
	DB_PASS: z.string().default(""),
	DB_HOST: z.string().min(1).default("localhost"),
	DB_PORT: z.coerce.number().int().default(3306),
	// JWT configs
	JWT_SECRET: z.string().min(1).default("changeme"),
	JWT_EXPIRES_IN: z.string().default("15m"),
	REFRESH_EXPIRES_IN: z.coerce.number().int().default(604800), // 7 days in seconds
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	throw new Error("Invalid environment variables");
}

export const env = {
	...parsedEnv.data,
	isDevelopment: parsedEnv.data.NODE_ENV === "development",
	isProduction: parsedEnv.data.NODE_ENV === "production",
	isTest: parsedEnv.data.NODE_ENV === "test",
};
