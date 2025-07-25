import { Sequelize } from "sequelize";
import { env } from "./env.config";

/**
 * Database configuration using Sequelize.
 * This file sets up the connection to the database using environment variables.
 */
const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
	host: env.DB_HOST,
	port: env.DB_PORT,
	dialect: "mysql",
	logging: false,
	define: {
		timestamps: false,
		freezeTableName: true,
	},
});

export default sequelize;
