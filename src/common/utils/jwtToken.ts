import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "@/common/configs/env.config";
import crypto from "crypto";

const JWT_SECRET: string = env.JWT_SECRET || "default_secret";
const JWT_EXPIRES_IN: string = env.JWT_EXPIRES_IN || "1h";

/**
 * Generate a JWT access token for a user.
 * @param payload Object to encode in token (should include `id` and `role`)
 * @param expiresIn Optional expiresIn (e.g. "15m"), defaults to env.JWT_EXPIRES_IN
 */
export function generateAccessToken(
	payload: { id: number; role: string },
	expiresIn: string = JWT_EXPIRES_IN
): string {
	if (!JWT_SECRET || typeof JWT_SECRET !== "string") {
		throw new Error("JWT_SECRET is not defined or not a string");
	}
	let expires: string | number = expiresIn;
	if (!isNaN(Number(expiresIn))) {
		expires = Number(expiresIn);
	}
	const options = { expiresIn: expires as any };
	return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify a JWT access token.
 * @param token The JWT string
 * @returns The decoded payload if valid, throws if invalid
 */
export function verifyAccessToken(token: string): { id: number; role: string } {
	return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
}

/**
 * Generate a cryptographically secure refresh token string.
 * @returns A new refresh token
 */
export function generateRefreshToken(): string {
	return crypto.randomBytes(48).toString("hex");
}
