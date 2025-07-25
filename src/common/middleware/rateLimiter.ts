import rateLimit from "express-rate-limit";
import { Request } from "express";
import { env } from "@/common/configs/env.config";

/**
 * Custom key generator for rate limiting based on IP address.
 */
function ipKeyGenerator(req: Request): string {
	return req.ip || "";
}

/**
 * Ensure that environment variables for rate limit are defined and of the correct type.
 * If not, use default values to avoid runtime errors.
 */
const MAX_REQUESTS =
	typeof env.COMMON_RATE_LIMIT_MAX_REQUESTS === "number"
		? env.COMMON_RATE_LIMIT_MAX_REQUESTS
		: 100; // default to 100 requests if undefined

const WINDOW_MS =
	typeof env.COMMON_RATE_LIMIT_WINDOW_MS === "number"
		? env.COMMON_RATE_LIMIT_WINDOW_MS
		: 1000; // default to 1000 ms (1 second) if undefined

const rateLimiter = rateLimit({
	legacyHeaders: true,
	max: MAX_REQUESTS,
	message: "Too many requests, please try again later.",
	standardHeaders: true,
	windowMs: WINDOW_MS,
	keyGenerator: ipKeyGenerator,
});

export default rateLimiter;
