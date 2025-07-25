import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { Router, Request, Response, NextFunction } from "express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
	UserSchema,
	CreateUserSchema,
	UpdateUserSchema,
	GetUserSchema,
	DeleteUserSchema,
} from "./user.model";
import { userController } from "./user.controller";
import { authenticateToken } from "@/common/middleware/authenticateToken.middleware";
import { authorizeRole } from "@/common/middleware/authorizeRole.middleware";
import { z } from "zod";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

// --- Debug Middleware (optional, for troubleshooting) ---
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
userRouter.use(debugRequest, debugResponse);

// GET /users (admin only)
userRegistry.registerPath({
	method: "get",
	path: "/users",
	tags: ["User"],
	responses: createApiResponse(z.array(UserSchema), "Success"),
});
userRouter.get(
	"/",
	authenticateToken,
	authorizeRole("ADMIN"),
	userController.getUsers
);

// GET /users/:id (user gets own profile; admin gets any)
userRegistry.registerPath({
	method: "get",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "Success"),
});
userRouter.get(
	"/:id",
	authenticateToken,
	validateRequest(GetUserSchema.shape.params, "params"),
	userController.getUser
);

// POST /users (admin only)
userRegistry.registerPath({
	method: "post",
	path: "/users",
	tags: ["User"],
	request: {
		body: {
			content: { "application/json": { schema: CreateUserSchema.shape.body } },
		},
	},
	responses: createApiResponse(UserSchema, "User created"),
});
userRouter.post(
	"/",
	authenticateToken,
	authorizeRole("ADMIN"),
	validateRequest(CreateUserSchema.shape.body, "body"),
	userController.createUser
);

// PATCH /users/:id (user updates own profile; admin updates any)
userRegistry.registerPath({
	method: "patch",
	path: "/users/{id}",
	tags: ["User"],
	request: {
		params: UpdateUserSchema.shape.params,
		body: {
			content: { "application/json": { schema: UpdateUserSchema.shape.body } },
		},
	},
	responses: createApiResponse(UserSchema, "User updated"),
});
userRouter.patch(
	"/:id",
	authenticateToken,
	validateRequest(UpdateUserSchema.shape.body, "body"),
	validateRequest(UpdateUserSchema.shape.params, "params"),
	userController.updateUser
);

// DELETE /users/:id (admin only)
userRegistry.registerPath({
	method: "delete",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: DeleteUserSchema.shape.params },
	responses: createApiResponse(z.null(), "User deleted"),
});
userRouter.delete(
	"/:id",
	authenticateToken,
	authorizeRole("ADMIN"),
	validateRequest(DeleteUserSchema.shape.params, "params"),
	userController.deleteUser
);
