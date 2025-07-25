import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { User } from "@/common/db/setupDatabase";
import { RefreshToken } from "@/common/db/setupDatabase";
import { hashPassword, verifyPassword } from "@/common/utils/hashPassword";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
} from "@/common/utils/jwtToken";
import { env } from "@/common/configs/env.config";

/**
 * Helper for debug logging. This can be replaced with a logger for production use.
 */
function debug(message: string, data?: any) {
	if (env.isDevelopment) {
		// eslint-disable-next-line no-console
		console.debug(`[AuthService DEBUG] ${message}`, data ?? "");
	}
}

export class AuthService {
	async register(email: string, password: string) {
		debug("register called", { email });
		try {
			const exists = await User.findOne({ where: { email } });
			debug("User existence check", { exists: !!exists });
			if (exists) {
				debug("Registration failed: email already exists");
				return ServiceResponse.failure(
					"Email already registered.",
					null,
					StatusCodes.CONFLICT
				);
			}
			const hashed = await hashPassword(password);
			debug("Password hashed", { hashed });
			await User.create({ email, password: hashed });
			debug("User created successfully", { email });
			return ServiceResponse.success(
				"Registration successful.",
				null,
				StatusCodes.CREATED
			);
		} catch (err) {
			debug("Registration error", err);
			return ServiceResponse.failure(
				"Registration failed.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async login(email: string, password: string) {
		debug("login called", { email });
		try {
			const user = await User.findOne({ where: { email } });
			debug("User found", { user: !!user, userId: user?.id });
			if (!user) {
				debug("Login failed: user not found");
				return ServiceResponse.failure(
					"Invalid credentials.",
					null,
					StatusCodes.UNAUTHORIZED
				);
			}
			const valid = await verifyPassword(password, user.password);
			debug("Password verification", { valid });
			if (!valid) {
				debug("Login failed: invalid password");
				return ServiceResponse.failure(
					"Invalid credentials.",
					null,
					StatusCodes.UNAUTHORIZED
				);
			}

			// Hapus semua refresh token user sebelum membuat yang baru
			await RefreshToken.destroy({ where: { user_id: user.id } });
			debug("All previous refresh tokens deleted", { userId: user.id });
			const accessToken = generateAccessToken({ id: user.id, role: user.role });
			const refreshToken = generateRefreshToken();
			const expiresAt = new Date(Date.now() + env.REFRESH_EXPIRES_IN * 1000);

			debug("Tokens generated", { accessToken, refreshToken, expiresAt });
			await RefreshToken.create({
				token: refreshToken,
				user_id: user.id,
				expires_at: expiresAt,
			});
			debug("Refresh token saved", { userId: user.id, refreshToken });

			// Sanitize user data (don't return password/hash)
			const { password: _pw, ...userSafe } = user.toJSON();

			return ServiceResponse.success("Login successful.", {
				accessToken,
				refreshToken,
				expiresAt,
				user: userSafe,
			});
		} catch (err) {
			debug("Login error", err);
			return ServiceResponse.failure(
				"Login failed.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async refreshToken(refreshToken: string) {
		debug("refreshToken called", { refreshToken });
		try {
			const token = await RefreshToken.findOne({
				where: {
					token: refreshToken,
					expires_at: { [Op.gt]: new Date() },
				},
			});
			debug("RefreshToken lookup", { tokenFound: !!token, tokenId: token?.id });
			if (!token || !token.user_id) {
				debug("Refresh failed: invalid/expired token");
				return ServiceResponse.failure(
					"Invalid or expired refresh token.",
					null,
					StatusCodes.UNAUTHORIZED
				);
			}
			// Fetch user by user_id
			const user = await User.findByPk(token.user_id);
			debug("User for refresh token", { userFound: !!user, userId: user?.id });
			if (!user) {
				// Invalidate the token if user does not exist
				await token.destroy();
				debug("User not found for refresh token, token destroyed");
				return ServiceResponse.failure(
					"User not found for this refresh token.",
					null,
					StatusCodes.UNAUTHORIZED
				);
			}
			// Invalidate old token
			await token.destroy();
			debug("Old refresh token invalidated", { token: refreshToken });

			// Issue new tokens
			const accessToken = generateAccessToken({ id: user.id, role: user.role });
			const newRefreshToken = generateRefreshToken();
			const expiresAt = new Date(Date.now() + env.REFRESH_EXPIRES_IN * 1000);

			await RefreshToken.create({
				token: newRefreshToken,
				user_id: user.id,
				expires_at: expiresAt,
			});
			debug("New refresh token created", { newRefreshToken, userId: user.id });

			return ServiceResponse.success("Token refreshed.", {
				accessToken,
				refreshToken: newRefreshToken,
				expiresAt,
			});
		} catch (err) {
			debug("Refresh token error", err);
			return ServiceResponse.failure(
				"Refresh token failed.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async logout(accessToken?: string) {
		debug("logout called", { accessToken });

		if (!accessToken) {
			debug("No access token provided for logout");
			return ServiceResponse.failure(
				"No access token provided.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}

		let userId: number | undefined;
		try {
			const decoded = verifyAccessToken(accessToken);
			userId = decoded.id;
			debug("Decoded accessToken for logout", { userId });
		} catch (err) {
			debug("Failed to decode access token for logout", err);
			return ServiceResponse.failure(
				"Invalid or expired access token.",
				null,
				StatusCodes.UNAUTHORIZED
			);
		}

		try {
			const count = await RefreshToken.destroy({
				where: { user_id: userId },
			});

			debug("RefreshToken destroy result", { count });

			if (count === 0) {
				debug("Logout failed: no refresh tokens found for user");
				// Success but no tokens found (idempotent logout)
				return ServiceResponse.success(
					"Logged out (no active session found).",
					null
				);
			}

			debug("Logged out successfully");
			return ServiceResponse.success("Logged out.", null);
		} catch (err) {
			debug("Logout error", err);
			return ServiceResponse.failure(
				"Logout failed.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async getMe(accessToken?: string, refreshToken?: string) {
		debug("getMe called", {
			accessToken: !!accessToken,
			refreshToken: !!refreshToken,
		});
		try {
			if (!accessToken) {
				debug("getMe failed: no access token provided");
				return ServiceResponse.failure(
					"No access token provided.",
					null,
					StatusCodes.UNAUTHORIZED
				);
			}
			let payload: any;
			try {
				payload = verifyAccessToken(accessToken);
				debug("AccessToken verified", { payload });
			} catch (err: any) {
				debug("AccessToken verify failed", { error: err });
				if (err.name === "TokenExpiredError" && refreshToken) {
					debug("AccessToken expired, trying refresh flow");
					const refreshResult = await this.refreshToken(refreshToken);
					if (refreshResult.success) {
						debug("Token refreshed via getMe", refreshResult.responseObject);
						return ServiceResponse.success(
							"Token refreshed. Please use new accessToken.",
							refreshResult.responseObject
						);
					}
					debug("Refresh failed in getMe, session expired");
					return ServiceResponse.failure(
						"Session expired. Please login again.",
						null,
						StatusCodes.UNAUTHORIZED
					);
				}
				return ServiceResponse.failure(
					"Invalid or expired access token.",
					null,
					StatusCodes.UNAUTHORIZED
				);
			}
			const user = await User.findByPk(payload.id);
			debug("User fetch in getMe", { userFound: !!user, userId: user?.id });
			if (!user) {
				debug("getMe failed: user not found");
				return ServiceResponse.failure(
					"User not found.",
					null,
					StatusCodes.NOT_FOUND
				);
			}
			return ServiceResponse.success("Authenticated.", {
				id: user.id,
				email: user.email,
				role: user.role,
			});
		} catch (err) {
			debug("getMe error", err);
			return ServiceResponse.failure(
				"Failed to get user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}
}
