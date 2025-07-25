import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ZodError, ZodSchema } from "zod";

import { ServiceResponse } from "@/common/utils/serviceResponse";

/**
 * Middleware for validating request using Zod schema with detailed debug logging.
 * For POST/PATCH (body), pass req.body. For GET (query), pass req.query. For param routes, pass req.params.
 * By default, validates req.body. Use the second argument to override for "query", "params", or "headers".
 * Example: validateRequest(schema, "body"|"query"|"params"|"headers")
 */
export const validateRequest =
	(schema: ZodSchema, pick: "body" | "query" | "params" | "headers" = "body") =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			let toValidate: any;
			switch (pick) {
				case "query":
					toValidate = req.query;
					break;
				case "params":
					toValidate = req.params;
					break;
				case "headers":
					toValidate = req.headers;
					break;
				default:
					toValidate = req.body;
			}
			await schema.parseAsync(toValidate);
			next();
		} catch (err) {
			const errors = (err as ZodError).errors.map((e) => {
				const fieldPath = e.path.length > 0 ? e.path.join(".") : "root";
				return `${fieldPath}: ${e.message}`;
			});

			const errorMessage =
				errors.length === 1
					? `Invalid input: ${errors[0]}`
					: `Invalid input (${errors.length} errors): ${errors.join("; ")}`;

			const statusCode = StatusCodes.BAD_REQUEST;

			// DEBUG: Log the invalid input, error details, and request context
			console.debug("[validateRequest] Validation failed:", {
				message: errorMessage,
				errors,
				request: {
					body: req.body,
					query: req.query,
					params: req.params,
					headers: req.headers,
					method: req.method,
					url: req.originalUrl,
				},
				stack: (err as Error).stack,
			});

			const serviceResponse = ServiceResponse.failure(
				errorMessage,
				{
					errors,
					debug: {
						body: req.body,
						query: req.query,
						params: req.params,
						headers: req.headers,
						method: req.method,
						url: req.originalUrl,
					},
				},
				statusCode
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		}
	};
