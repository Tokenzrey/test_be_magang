import bcrypt from "bcrypt";

/**
 * Hash a plaintext password using bcrypt.
 * @param password Plain text password
 * @returns Promise<string> The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain password with a bcrypt hash.
 * @param password Plain text password
 * @param hash Bcrypt hashed password
 * @returns Promise<boolean> True if match, else false
 */
export async function verifyPassword(
	password: string,
	hash: string
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}
