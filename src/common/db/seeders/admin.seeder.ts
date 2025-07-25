import { User } from "../setupDatabase";
import { hashPassword } from "@/common/utils/hashPassword";

/**
 * Seeds an admin user into the database if one does not already exist.
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from env, or fallback values.
 */
export async function seedAdmin() {
	const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
	const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

	const existingAdmin = await User.findOne({
		where: { email: adminEmail, role: "ADMIN" },
	});

	if (!existingAdmin) {
		const hashed = await hashPassword(adminPassword);
		await User.create({ email: adminEmail, password: hashed, role: "ADMIN" });
		console.log(`✅ Admin user seeded: ${adminEmail}`);
	} else {
		console.log("ℹ️ Admin user already exists.");
	}
}

// Untuk menjalankan via CLI (langsung node src/common/db/seeders/admin.seeder.ts):
if (require.main === module) {
	// Import seeder runner and execute this seeder
	import("../setupDatabase").then(({ runSeeder }) => {
		runSeeder(seedAdmin);
	});
}
