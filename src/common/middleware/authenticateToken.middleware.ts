import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { env } from "@/common/configs/env.config";

export function authenticateToken(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const authHeader = req.headers["authorization"];
	if (!authHeader || typeof authHeader !== "string") {
		return res
			.status(401)
			.json(ServiceResponse.failure("No token provided.", null, 401));
	}
	const token = authHeader.replace("Bearer ", "");
	try {
		const user = jwt.verify(token, process.env.JWT_SECRET || env.JWT_SECRET);
		// Attach user info to request
		(req as any).user = user;
		next();
	} catch (err) {
		return res
			.status(401)
			.json(ServiceResponse.failure("Invalid or expired token.", null, 401));
	}
}

// Usage: app.use(authenticateToken) on protected routes
