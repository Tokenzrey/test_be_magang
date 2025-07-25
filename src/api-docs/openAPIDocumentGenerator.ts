import {
	OpenAPIRegistry,
	OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { healthCheckRegistry } from "@/api/healthCheck/healthCheck.router";
import { userRegistry } from "@/api/user/user.router";
import { authRegistry } from "@/api/auth/auth.router";
import { vehicleRegistry } from "@/api/vehicle/vehicle.router";
import { telementryLogRegistry } from "@/api/telementryLog/telementryLog.router";

export type OpenAPIDocument = ReturnType<
	OpenApiGeneratorV3["generateDocument"]
>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([
		healthCheckRegistry,
		userRegistry,
		authRegistry,
		vehicleRegistry,
		telementryLogRegistry,
	]);
	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Swagger API",
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
	});
}
