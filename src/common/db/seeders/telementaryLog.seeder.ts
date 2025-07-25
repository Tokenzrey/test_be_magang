import TelemetryLog from "../models/telementryLog";
import Vehicle from "../models/vehicle";

/**
 * Seeds sample telemetry logs for all vehicles in the database.
 * Each vehicle gets 15 telemetry logs.
 */
export async function seedTelemetryLogs() {
	const vehicles = await Vehicle.findAll();
	const logs = [];
	const now = new Date();
	const logCountPerVehicle = 15;
	for (const vehicle of vehicles) {
		let baseOdometer = Math.floor(Math.random() * 50000) + 10000;
		for (let i = 0; i < logCountPerVehicle; i++) {
			const minutesAgo =
				(logCountPerVehicle - i) * 30 + Math.floor(Math.random() * 10);
			const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);
			logs.push({
				vehicle_id: vehicle.id,
				timestamp,
				data: {
					odometer: baseOdometer + i * Math.floor(Math.random() * 100 + 20),
					fuel_level: Math.max(
						0,
						Math.min(100, 100 - i * Math.floor(Math.random() * 10 + 5))
					),
					speed: Math.floor(Math.random() * 120),
					lat: -6.2 + Math.random() * 0.2 - 0.1 + i * 0.001,
					lon: 106.8 + Math.random() * 0.2 - 0.1 + i * 0.001,
				},
			});
		}
	}

	for (const log of logs) {
		// Check if a similar log already exists for this vehicle and timestamp
		const exists = await TelemetryLog.findOne({
			where: {
				vehicle_id: log.vehicle_id,
				timestamp: log.timestamp,
			},
		});
		if (!exists) {
			await TelemetryLog.create(log);
			console.log(
				`✅ TelemetryLog seeded for vehicle_id=${log.vehicle_id} @ ${log.timestamp}`
			);
		} else {
			console.log(
				`ℹ️ TelemetryLog already exists for vehicle_id=${log.vehicle_id} @ ${log.timestamp}`
			);
		}
	}
}

// Untuk menjalankan via CLI (langsung node src/common/db/seeders/telementryLog.seeder.ts):
if (require.main === module) {
	import("../setupDatabase").then(({ runSeeder }) => {
		runSeeder(seedTelemetryLogs);
	});
}
