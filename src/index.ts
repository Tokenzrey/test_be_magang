import { env } from "@/common/configs/env.config";
import { app, logger } from "@/server";
import { connectAndMigrate } from "@/common/db/setupDatabase";

/**
 * Main entry point for the application.
 * Connects to the database, runs migrations, and starts the server.
 */
connectAndMigrate()
	.then(() => {
		const server = app.listen(env.PORT, () => {
			const { NODE_ENV, HOST, PORT } = env;
			logger.info(`Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
		});

		const onCloseSignal = () => {
			logger.info("sigint received, shutting down");
			server.close(() => {
				logger.info("server closed");
				process.exit();
			});
			setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
		};

		process.on("SIGINT", onCloseSignal);
		process.on("SIGTERM", onCloseSignal);
	})
	.catch((err) => {
		logger.error("❌ Failed to start server due to DB error:", err);
		process.exit(1);
	});
