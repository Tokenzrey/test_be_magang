import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../configs/database.config";
import User from "./user";

/**
 * Vehicle model attributes.
 */
export interface VehicleAttributes {
	id: number;
	name: string;
	license_plate: string;
	model?: string | null;
	status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
	user_id: number; // Add user_id as FK
	created_at?: Date;
	updated_at?: Date;
	deleted_at?: Date | null;
}

/**
 * Used for Vehicle.create. All except id are required, id/created_at/updated_at/deleted_at auto-managed.
 */
export interface VehicleCreationAttributes
	extends Optional<
		VehicleAttributes,
		"id" | "model" | "status" | "created_at" | "updated_at" | "deleted_at"
	> {}

class Vehicle
	extends Model<VehicleAttributes, VehicleCreationAttributes>
	implements VehicleAttributes
{
	declare id: number;
	declare name: string;
	declare license_plate: string;
	declare model?: string | null;
	declare status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
	declare user_id: number;
	declare created_at?: Date;
	declare updated_at?: Date;
	declare deleted_at?: Date | null;
}

Vehicle.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		license_plate: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		model: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		status: {
			type: DataTypes.ENUM("ACTIVE", "INACTIVE", "MAINTENANCE"),
			allowNull: false,
			defaultValue: "INACTIVE",
		},
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			references: { model: "users", key: "id" },
			onDelete: "CASCADE",
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		deleted_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		sequelize,
		tableName: "vehicles",
		timestamps: true,
		paranoid: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
	}
);

// Association
Vehicle.belongsTo(User, { foreignKey: "user_id", as: "user" });

export default Vehicle;
