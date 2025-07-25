import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "./auth.controller";
import { z } from "zod";
import { validateRequest } from "@/common/utils/httpHandlers";
import { commonValidations } from "@/common/utils/commonValidation";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticateToken } from "@/common/middleware/authenticateToken.middleware";

// --- Debug Middleware ---
function debugRequest(req: Request, res: Response, next: NextFunction) {
	console.debug(`[DEBUG][${req.method}] ${req.originalUrl}`);
	console.debug("Headers:", JSON.stringify(req.headers, null, 2));
	console.debug("Body:", JSON.stringify(req.body, null, 2));
	console.debug("Query:", JSON.stringify(req.query, null, 2));
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

export const AuthRegisterRequestSchema = z.object({
	email: commonValidations.email,
	password: commonValidations.password,
});
export const AuthLoginRequestSchema = z.object({
	email: commonValidations.email,
	password: z.string(),
});
export const AuthTokenResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	expiresAt: z.date(),
});
export const AuthMeResponseSchema = z.object({
	id: z.number(),
	email: z.string().email(),
	role: z.enum(["USER", "ADMIN"]),
});

// --- OpenAPI Registry ---
export const authRegistry = new OpenAPIRegistry();

authRegistry.registerPath({
	method: "post",
	path: "/register",
	tags: ["Auth"],
	request: {
		body: {
			content: { "application/json": { schema: AuthRegisterRequestSchema } },
		},
	},
	responses: createApiResponse(z.null(), "Registration successful"),
});
authRegistry.registerPath({
	method: "post",
	path: "/login",
	tags: ["Auth"],
	request: {
		body: {
			content: { "application/json": { schema: AuthLoginRequestSchema } },
		},
	},
	responses: createApiResponse(AuthTokenResponseSchema, "Login successful"),
});
authRegistry.registerPath({
	method: "post",
	path: "/refresh",
	tags: ["Auth"],
	request: { headers: z.object({ "x-refresh-token": z.string() }) },
	responses: createApiResponse(AuthTokenResponseSchema, "Token refreshed"),
});
authRegistry.registerPath({
	method: "post",
	path: "/logout",
	tags: ["Auth"],
	request: { headers: z.object({ authorization: z.string() }) },
	responses: createApiResponse(z.null(), "Logged out"),
});
authRegistry.registerPath({
	method: "get",
	path: "/me",
	tags: ["Auth"],
	request: { headers: z.object({ authorization: z.string() }) },
	responses: createApiResponse(AuthMeResponseSchema, "Authenticated"),
});

// --- Router ---
const router: Router = express.Router();
const controller = new AuthController();

// Attach debug middleware globally to all auth routes
router.use(debugRequest, debugResponse);

// Registration
router.post(
	"/register",
	validateRequest(AuthRegisterRequestSchema, "body"),
	controller.register
);

// Login
router.post(
	"/login",
	validateRequest(AuthLoginRequestSchema, "body"),
	controller.login
);

// Refresh Token
router.post(
	"/refresh",
	validateRequest(z.object({ "x-refresh-token": z.string() }), "headers"),
	controller.refreshToken
);

// Logout
router.post(
	"/logout",
	validateRequest(z.object({ authorization: z.string() }), "headers"),
	authenticateToken,
	controller.logout
);

// Get authenticated user info
router.get(
	"/me",
	validateRequest(z.object({ authorization: z.string() }), "headers"),
	authenticateToken,
	controller.getMe
);

export { router as authRouter };
