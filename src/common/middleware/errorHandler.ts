import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { logger } from "@/server";

/**
 * Middleware for handling unexpected (404) requests.
 * Sends a standardized not found response.
 */
const unexpectedRequest: RequestHandler = (_req, res) => {
	res
		.status(StatusCodes.NOT_FOUND)
		.send(
			ServiceResponse.failure(
				"Endpoint not found.",
				null,
				StatusCodes.NOT_FOUND
			)
		);
};

/**
 * Error logging middleware: attaches error to res.locals and logs error.
 */
const addErrorToRequestLog: ErrorRequestHandler = (err, req, res, next) => {
	res.locals.err = err;

	// Log error details
	if (logger) {
		logger.error(
			{
				method: req.method,
				url: req.originalUrl,
				status: res.statusCode,
				error: {
					message: err.message,
					stack: err.stack,
				},
			},
			"Request error"
		);
	}

	next(err);
};

/**
 * Centralized error handler middleware.
 * Catches errors from any layer and sends a standardized ServiceResponse error.
 */
const handleError: ErrorRequestHandler = (err, _req, res, _next) => {
	let statusCode =
		err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR;
	let message = err.message || "Internal Server Error";

	// Handle common error types
	if (err.name === "ValidationError" || err.name === "ZodError") {
		statusCode = StatusCodes.BAD_REQUEST;
		message = `Validation error: ${err.message}`;
	}

	if (err.name === "SequelizeUniqueConstraintError") {
		statusCode = StatusCodes.CONFLICT;
		message = "Duplicate entry: " + (err.errors?.[0]?.message || err.message);
	}

	res
		.status(statusCode)
		.send(ServiceResponse.failure(message, null, statusCode));
};

/**
 * Export as array of middlewares for direct use in Express app.
 * Usage: app.use(...errorHandler);
 */
export const errorHandler: [
	RequestHandler,
	ErrorRequestHandler,
	ErrorRequestHandler
] = [unexpectedRequest, addErrorToRequestLog, handleError];
