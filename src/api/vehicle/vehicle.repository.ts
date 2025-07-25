/**
 * VehicleRepository - Handles all database operations for Vehicles and TelemetryLogs.
 * Uses Sequelize models and provides clean, reusable methods for vehicle and telemetry log logic.
 * - All "soft deletes" use paranoid=true on Vehicle model.
 * - TelemetryLog is read-only (no update/delete), but you can add if needed.
 * - Each Vehicle belongs to a User (user_id is required).
 */

import { Op, Transaction } from "sequelize";
import Vehicle, {
	VehicleAttributes,
	VehicleCreationAttributes,
} from "@/common/db/models/vehicle";
import TelemetryLog from "@/common/db/models/telementryLog";

export class VehicleRepository {
	/**
	 * Create a new vehicle. Must include user_id.
	 */
	async createVehicle(
		data: VehicleCreationAttributes,
		options?: { transaction?: Transaction }
	): Promise<Vehicle> {
		return Vehicle.create(data, { ...options });
	}

	/**
	 * Find a vehicle by id (excluding soft-deleted).
	 * Optionally include the related user.
	 */
	async findById(
		id: number,
		options?: { transaction?: Transaction; includeUser?: boolean }
	): Promise<Vehicle | null> {
		return Vehicle.findOne({
			where: { id },
			include: options?.includeUser ? [{ association: "user" }] : undefined,
			...options,
		});
	}

	/**
	 * Find a vehicle by license_plate (excluding soft-deleted).
	 */
	async findByLicensePlate(
		license_plate: string,
		options?: { transaction?: Transaction }
	): Promise<Vehicle | null> {
		return Vehicle.findOne({
			where: { license_plate },
			...options,
		});
	}

	/**
	 * Find all vehicles, with optional filters (search, status, user_id), pagination.
	 * Returns { rows, count } for paginated list.
	 */
	async findVehicles(opts: {
		search?: string;
		status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
		user_id?: number;
		page?: number;
		limit?: number;
		transaction?: Transaction;
	}): Promise<{ rows: Vehicle[]; count: number }> {
		const { search, status, user_id, page = 1, limit = 10, transaction } = opts;
		const where: Record<string, any> = {};
		if (status) where.status = status;
		if (typeof user_id === "number") where.user_id = user_id;
		if (search) {
			where[Op.or as any] = [
				{ name: { [Op.like]: `%${search}%` } },
				{ license_plate: { [Op.like]: `%${search}%` } },
			];
		}

		return Vehicle.findAndCountAll({
			where,
			offset: (page - 1) * limit,
			limit,
			order: [["created_at", "DESC"]],
			transaction,
		});
	}

	/**
	 * Update a vehicle by id. Returns updated vehicle or null if not found.
	 * user_id cannot be set to null.
	 */
	async updateVehicle(
		id: number,
		updates: Partial<VehicleAttributes>,
		options?: { transaction?: Transaction }
	): Promise<Vehicle | null> {
		const vehicle = await Vehicle.findByPk(id, options);
		if (!vehicle) return null;
		await vehicle.update(updates, options);
		return vehicle;
	}

	/**
	 * Soft delete (paranoid) a vehicle by id.
	 * Returns true if deleted, false if not found.
	 */
	async softDeleteVehicle(
		id: number,
		options?: { transaction?: Transaction }
	): Promise<boolean> {
		const count = await Vehicle.destroy({
			where: { id },
			...options,
		});
		return count > 0;
	}
    
}

const vehicleRepository = new VehicleRepository();
export default vehicleRepository;
