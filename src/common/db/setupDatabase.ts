import sequelize from "../configs/database.config";
import User from "./models/user";
import RefreshToken from "./models/refreshToken";
import { setupAssociations } from "./models/associate";

// Setup associations between models
setupAssociations();

/**
 * Connect to the database and synchronize models.
 * This function should be called at application startup.
 */
export async function connectAndMigrate() {
	try {
		await sequelize.authenticate();
		await sequelize.sync({ alter: false });
		console.log("✅ Database connected and models synchronized!");
	} catch (err) {
		console.error("❌ Database connection or migration failed:", err);
		throw err;
	}
}

/**
 * Run a seeder function after connecting to the database.
 * This is useful for running seeders from CLI or programmatically.
 * @param seederFn The seeder function to run.
 */
export async function runSeeder(seederFn: () => Promise<void>) {
	try {
		await connectAndMigrate();
		await seederFn();
		console.log("✅ Seeding completed.");
		process.exit(0);
	} catch (err) {
		console.error("❌ Seeding failed:", err);
		process.exit(1);
	}
}

export { sequelize, User, RefreshToken };
