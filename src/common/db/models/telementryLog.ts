import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../configs/database.config";

/**
 * TelemetryLog model attributes.
 */
export interface TelemetryLogAttributes {
	id: number;
	vehicle_id: number;
	timestamp: Date;
	data: object; // or string if you want to store as stringified JSON
}

/**
 * Used for TelemetryLog.create. id is optional (auto-increment).
 */
export interface TelemetryLogCreationAttributes
	extends Optional<TelemetryLogAttributes, "id"> {}

class TelemetryLog
	extends Model<TelemetryLogAttributes, TelemetryLogCreationAttributes>
	implements TelemetryLogAttributes
{
	declare id: number;
	declare vehicle_id: number;
	declare timestamp: Date;
	declare data: object;
}

TelemetryLog.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		vehicle_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			references: { model: "vehicles", key: "id" },
			onDelete: "CASCADE",
		},
		timestamp: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		data: {
			type: DataTypes.JSON,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "telemetry_logs",
		timestamps: false,
	}
);

export default TelemetryLog;
