import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { healthCheckRouter } from "@/api/healthCheck/healthCheck.router";
import { userRouter } from "@/api/user/user.router";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { errorHandler } from "./common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import pinoHttp from "pino-http";
import { authRouter } from "./api/auth/auth.router";
import { vehicleRouter } from "./api/vehicle/vehicle.router";
import { telementryLogRouter } from "./api/telementryLog/telementryLog.router";

const logger = pino({
	level: process.env.NODE_ENV === "development" ? "debug" : "info",
});

const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: "*", // mengizinkan semua origin
		credentials: false, // HARUS false jika origin "*"
		allowedHeaders: "*", // mengizinkan semua header
		methods: "*", // mengizinkan semua method (GET, POST, dst)
		optionsSuccessStatus: 200,
	})
);

app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/vehicles", vehicleRouter);
app.use("/telementry-logs", telementryLogRouter);
// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(...errorHandler);

export { app, logger };
