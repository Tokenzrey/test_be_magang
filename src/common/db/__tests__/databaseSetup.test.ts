import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
	sequelize,
	User,
	RefreshToken,
	connectAndMigrate,
} from "../setupDatabase";
import { seedAdmin } from "../seeders/admin.seeder";
import { seedVehicles } from "../seeders/vehicle.seeder";
import { seedTelemetryLogs } from "../seeders/telementaryLog.seeder";
import { UniqueConstraintError } from "sequelize";

describe("Database Setup, Migration, and Seeder", () => {
	beforeAll(async () => {
		await sequelize.sync({ force: true });
	});

	afterAll(async () => {
		await sequelize.close();
	});

	it("should connect and migrate all models without error", async () => {
		await expect(connectAndMigrate()).resolves.not.toThrow();
		const tables = await sequelize.getQueryInterface().showAllTables();
		expect(tables).toContain("users");
		expect(tables).toContain("refresh_tokens");
	});

	it("should enforce unique email constraint on User", async () => {
		await User.create({
			email: "unique@example.com",
			password: "hashedpassword",
			role: "USER",
		});

		let error;
		try {
			await User.create({
				email: "unique@example.com",
				password: "anotherhash",
				role: "USER",
			});
		} catch (err: any) {
			error = err;
		}
		// Accept either UniqueConstraintError or generic ValidationError
		expect(error).toBeTruthy();
		if (error && error.name) {
			expect(
				error instanceof UniqueConstraintError ||
					/unique|Validation/i.test(error.message)
			).toBe(true);
		}
	});

	it("should enforce required fields and enum constraints", async () => {
		// Missing email
		await expect(
			User.create({
				password: "hash",
				role: "USER",
			} as any)
		).rejects.toThrow();

		// Invalid role - expect any error, check for 'truncated' or generic error
		await expect(
			User.create({
				email: "test2@example.com",
				password: "hash",
				role: "INVALID_ROLE",
			} as any)
		).rejects.toThrow(/truncated|incorrect|enum|Validation/i);
	});

	it("should enforce foreign key and CASCADE on refresh_tokens", async () => {
		const user = await User.create({
			email: "cascade@example.com",
			password: "hash",
			role: "USER",
		});
		const token = await RefreshToken.create({
			token: "sometoken",
			user_id: user.id,
			expires_at: new Date(Date.now() + 100000),
		});

		// Pastikan token memang ada
		const foundBefore = await RefreshToken.findByPk(token.id);
		expect(foundBefore).not.toBeNull();

		// Delete user, token should be gone (CASCADE)
		await user.destroy();
		const found = await RefreshToken.findByPk(token.id);
		expect(found).toBeNull();
	});

	it("should seed admin user only if not present", async () => {
		await seedAdmin();
		const admin = await User.findOne({ where: { role: "ADMIN" } });
		expect(admin).not.toBeNull();

		await seedAdmin();
		const admins = await User.findAll({ where: { role: "ADMIN" } });
		expect(admins.length).toBe(1);
	});

	it("should seed vehicles if not present", async () => {
		await seedVehicles();
		const vehicles = await (
			await import("../models/vehicle")
		).default.findAll();
		expect(vehicles.length).toBeGreaterThanOrEqual(3);
	});

	it("should seed telemetry logs for all vehicles", async () => {
		await seedVehicles();
		await seedTelemetryLogs();
		const TelemetryLog = (await import("../models/telementryLog")).default;
		const Vehicle = (await import("../models/vehicle")).default;
		const vehicles = await Vehicle.findAll();
		for (const vehicle of vehicles) {
			const logs = await TelemetryLog.findAll({
				where: { vehicle_id: vehicle.id },
			});
			expect(logs.length).toBeGreaterThanOrEqual(2);
		}
	});
});
