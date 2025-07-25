/**
 * TelemetryLogRepository - Handles all database operations for TelemetryLogs.
 * CRUD is restricted to logs belonging to vehicles owned by the user's user_id.
 * Now includes statistics and latest telemetry log utilities.
 */

import { Op, Transaction } from "sequelize";
import TelemetryLog, {
	TelemetryLogAttributes,
	TelemetryLogCreationAttributes,
} from "@/common/db/models/telementryLog";
import Vehicle from "@/common/db/models/vehicle";

export class TelemetryLogRepository {
	/**
	 * Create a new telemetry log.
	 */
	async createTelemetryLog(
		data: TelemetryLogCreationAttributes,
		options?: { transaction?: Transaction }
	): Promise<TelemetryLog> {
		return TelemetryLog.create(data, { ...options });
	}

	/**
	 * Get telemetry log by id.
	 */
	async findById(
		id: number,
		options?: { transaction?: Transaction }
	): Promise<TelemetryLog | null> {
		return TelemetryLog.findByPk(id, options);
	}

	/**
	 * Update a telemetry log by id.
	 */
	async updateTelemetryLog(
		id: number,
		updates: Partial<TelemetryLogAttributes>,
		options?: { transaction?: Transaction }
	): Promise<TelemetryLog | null> {
		const log = await TelemetryLog.findByPk(id, options);
		if (!log) return null;
		await log.update(updates, options);
		return log;
	}

	/**
	 * Delete a telemetry log by id (hard delete).
	 */
	async deleteTelemetryLog(
		id: number,
		options?: { transaction?: Transaction }
	): Promise<boolean> {
		const count = await TelemetryLog.destroy({
			where: { id },
			...options,
		});
		return count > 0;
	}

	/**
	 * Get all telemetry logs for a vehicle, with pagination and date filter.
	 */
	async getTelemetryLogsForVehicle(opts: {
		vehicle_id: number;
		from?: Date;
		to?: Date;
		page?: number;
		limit?: number;
		transaction?: Transaction;
	}): Promise<{ rows: TelemetryLog[]; count: number }> {
		const { vehicle_id, from, to, page = 1, limit = 50, transaction } = opts;
		const where: Record<string, any> = { vehicle_id };
		if (from) {
			if (!where.timestamp) where.timestamp = {};
			where.timestamp[Op.gte] = from;
		}
		if (to) {
			if (!where.timestamp) where.timestamp = {};
			where.timestamp[Op.lte] = to;
		}
		return TelemetryLog.findAndCountAll({
			where,
			order: [["timestamp", "DESC"]],
			offset: (page - 1) * limit,
			limit,
			transaction,
		});
	}

	/**
	 * Get ALL telemetry logs for a vehicle (without pagination).
	 */
	async getAllTelemetryLogsForVehicle(
		vehicle_id: number
	): Promise<TelemetryLog[]> {
		return TelemetryLog.findAll({
			where: { vehicle_id },
			order: [["timestamp", "DESC"]],
		});
	}

	/**
	 * Get latest telemetry log for a single vehicle.
	 */
	async getLatestTelemetryLog(
		vehicle_id: number,
		options?: { transaction?: Transaction }
	): Promise<TelemetryLog | null> {
		const log = await TelemetryLog.findOne({
			where: { vehicle_id },
			order: [["timestamp", "DESC"]],
			...options,
		});
		console.debug(
			`[getLatestTelemetryLog] vehicle_id=${vehicle_id}, log=${
				log ? log.id : null
			}`
		);
		return log;
	}

	/**
	 * Get latest telemetry logs for multiple vehicles.
	 * Returns a map of vehicle_id to TelemetryLog or null if not found.
	 */
	async getLatestTelemetryLogsForVehicles(
		vehicleIds: number[]
	): Promise<Record<number, TelemetryLog | null>> {
		const result: Record<number, TelemetryLog | null> = {};
		if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
			console.debug(
				"[getLatestTelemetryLogsForVehicles] Empty vehicleIds, returning empty result"
			);
			return result;
		}
		console.debug(
			"[getLatestTelemetryLogsForVehicles] vehicleIds:",
			vehicleIds
		);
		for (const id of vehicleIds) {
			const idNum = Number(id);
			if (!Number.isInteger(idNum) || idNum <= 0) {
				console.warn(
					`[getLatestTelemetryLogsForVehicles] Skip invalid vehicleId: ${id}`
				);
				continue;
			}
			const log = await this.getLatestTelemetryLog(idNum);
			console.debug(
				`[getLatestTelemetryLogsForVehicles] vehicle_id=${idNum}, log_id=${
					log ? log.id : null
				}`
			);
			result[idNum] = log || null;
		}
		console.debug(
			"[getLatestTelemetryLogsForVehicles] result keys:",
			Object.keys(result)
		);
		return result;
	}

	/**
	 * Ensure vehicle belongs to user_id.
	 */
	async isVehicleOwnedByUser(
		vehicle_id: number,
		user_id: number
	): Promise<boolean> {
		const vehicle = await Vehicle.findOne({
			where: { id: vehicle_id, user_id },
		});
		return !!vehicle;
	}

	/**
	 * Get vehicle by telemetry log id, including user_id.
	 */
	async getVehicleOfTelemetry(logId: number): Promise<Vehicle | null> {
		const log = await TelemetryLog.findByPk(logId);
		if (!log) return null;
		return Vehicle.findOne({ where: { id: log.vehicle_id } });
	}

	/**
	 * Get stats of vehicles, grouped by status, for a specific user_id (or all if admin).
	 * Returns: { total, parked, moving, maintenance }
	 */
	async getVehicleStatsByUserId(user_id: number, isAdmin: boolean) {
		const where: any = { deleted_at: null };
		if (!isAdmin) {
			where.user_id = user_id;
		}
		const vehicles = await Vehicle.findAll({
			where,
			attributes: ["id", "status"],
		});

		const vehicleIds = vehicles.map((v) => v.id);

		let total = vehicles.length;
		let moving = 0;
		let maintenance = 0;

		// Maintenance: vehicles with status "MAINTENANCE"
		maintenance = vehicles.filter((v) => v.status === "MAINTENANCE").length;

		// Moving: vehicles with status "ACTIVE"
		moving = vehicles.filter((v) => v.status === "ACTIVE").length;

		// Parked: total - moving - maintenance
		const parked = total - moving - maintenance;

		return {
			total,
			parked,
			moving,
			maintenance,
		};
	}
}

export const telementryLogRepository = new TelemetryLogRepository();
