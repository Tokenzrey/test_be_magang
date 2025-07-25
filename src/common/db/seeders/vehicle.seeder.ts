import Vehicle from "../models/vehicle";

/**
 * Seeds initial vehicles into the database if not already present.
 */
export async function seedVehicles() {
	const vehiclesData = [
		{
			name: "Fleet Car 1",
			license_plate: "B1234ABC",
			model: "Toyota Avanza",
			status: "ACTIVE" as const,
			user_id: 1,
		},
		{
			name: "Fleet Car 2",
			license_plate: "D5678DEF",
			model: "Honda Jazz",
			status: "INACTIVE" as const,
			user_id: 1,
		},
		{
			name: "Service Truck",
			license_plate: "F9999TRK",
			model: "Isuzu Panther",
			status: "MAINTENANCE" as const,
			user_id: 1,
		},
		{
			name: "Garbage Truck 1",
			license_plate: "B1111TRK",
			model: "Hino Dutro",
			status: "ACTIVE" as const,
			user_id: 1,
		},
		{
			name: "Garbage Truck 2",
			license_plate: "B2222TRK",
			model: "Mitsubishi Fuso",
			status: "INACTIVE" as const,
			user_id: 1,
		},
		{
			name: "Pickup 1",
			license_plate: "B3333PU",
			model: "Suzuki Carry",
			status: "ACTIVE" as const,
			user_id: 1,
		},
		{
			name: "Pickup 2",
			license_plate: "B4444PU",
			model: "Daihatsu Gran Max",
			status: "MAINTENANCE" as const,
			user_id: 1,
		},
		{
			name: "Dump Truck",
			license_plate: "B5555DT",
			model: "Toyota Dyna",
			status: "ACTIVE" as const,
			user_id: 1,
		},
		{
			name: "Sweeper",
			license_plate: "B6666SWP",
			model: "FAUN Viajet",
			status: "INACTIVE" as const,
			user_id: 1,
		},
		{
			name: "Water Tanker",
			license_plate: "B7777WT",
			model: "Isuzu Giga",
			status: "MAINTENANCE" as const,
			user_id: 1,
		},
	];

	for (const vehicle of vehiclesData) {
		const exists = await Vehicle.findOne({
			where: {
				license_plate: vehicle.license_plate,
			},
			paranoid: false,
		});
		if (!exists) {
			await Vehicle.create(vehicle);
			console.log(`✅ Vehicle seeded: ${vehicle.license_plate}`);
		} else {
			console.log(`ℹ️ Vehicle already exists: ${vehicle.license_plate}`);
		}
	}
}

// Untuk menjalankan via CLI (langsung node src/common/db/seeders/vehicle.seeder.ts):
if (require.main === module) {
	import("../setupDatabase").then(({ runSeeder }) => {
		runSeeder(seedVehicles);
	});
}
