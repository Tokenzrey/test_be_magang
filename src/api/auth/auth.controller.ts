import { Request, Response } from "express";
import { AuthService } from "./auth.service";

// Helper for logging (adjust as needed for your logger setup)
import { logger } from "@/server";

export class AuthController {
	private authService = new AuthService();

	register = async (req: Request, res: Response) => {
		const { email, password } = req.body;
		logger.debug(
			{ email, where: "AuthController.register" },
			"Register request received"
		);
		try {
			const result = await this.authService.register(email, password);
			logger.debug(
				{ result, where: "AuthController.register" },
				"Register result"
			);
			res.status(result.statusCode).json(result);
		} catch (error) {
			logger.error(
				{ error, where: "AuthController.register" },
				"Register error"
			);
			res
				.status(500)
				.json({ message: "Internal Server Error", error: String(error) });
		}
	};

	login = async (req: Request, res: Response) => {
		const { email, password } = req.body;
		logger.debug(
			{ email, where: "AuthController.login" },
			"Login request received"
		);
		try {
			const result = await this.authService.login(email, password);
			logger.debug({ result, where: "AuthController.login" }, "Login result");
			res.status(result.statusCode).json(result);
		} catch (error) {
			logger.error({ error, where: "AuthController.login" }, "Login error");
			res
				.status(500)
				.json({ message: "Internal Server Error", error: String(error) });
		}
	};

	refreshToken = async (req: Request, res: Response) => {
		const refreshToken = req.headers["x-refresh-token"] as string;
		logger.debug(
			{ refreshToken, where: "AuthController.refreshToken" },
			"Refresh token request received"
		);
		try {
			const result = await this.authService.refreshToken(refreshToken);
			logger.debug(
				{ result, where: "AuthController.refreshToken" },
				"Refresh token result"
			);
			res.status(result.statusCode).json(result);
		} catch (error) {
			logger.error(
				{ error, where: "AuthController.refreshToken" },
				"Refresh token error"
			);
			res
				.status(500)
				.json({ message: "Internal Server Error", error: String(error) });
		}
	};

	logout = async (req: Request, res: Response) => {
		const accessToken = req.headers["authorization"]?.replace(
			/^Bearer\s+/i,
			""
		) as string | undefined;
		logger.debug(
			{ accessToken, where: "AuthController.logout" },
			"Logout request received"
		);
		try {
			const result = await this.authService.logout(accessToken);
			logger.debug({ result, where: "AuthController.logout" }, "Logout result");
			res.status(result.statusCode).json(result);
		} catch (error) {
			logger.error({ error, where: "AuthController.logout" }, "Logout error");
			res
				.status(500)
				.json({ message: "Internal Server Error", error: String(error) });
		}
	};

	getMe = async (req: Request, res: Response) => {
		const accessToken = req.headers["authorization"]?.replace(
			/^Bearer\s+/i,
			""
		) as string;
		const refreshToken = req.headers["x-refresh-token"] as string | undefined;
		logger.debug(
			{ accessToken, refreshToken, where: "AuthController.getMe" },
			"GetMe request received"
		);
		try {
			const result = await this.authService.getMe(accessToken, refreshToken);
			logger.debug({ result, where: "AuthController.getMe" }, "GetMe result");
			res.status(result.statusCode).json(result);
		} catch (error) {
			logger.error({ error, where: "AuthController.getMe" }, "GetMe error");
			res
				.status(500)
				.json({ message: "Internal Server Error", error: String(error) });
		}
	};
}
