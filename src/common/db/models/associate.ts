import User from "./user";
import RefreshToken from "./refreshToken";
import Vehicle from "./vehicle";
import TelemetryLog from "./telementryLog";

/**
 * Setup associations between models.
 * This function should be called after all models are imported.
 */
export function setupAssociations() {
	// User - RefreshToken (1:N)
	User.hasMany(RefreshToken, {
		foreignKey: "user_id",
		as: "refreshTokens",
		onDelete: "CASCADE",
		hooks: true,
	});
	RefreshToken.belongsTo(User, {
		foreignKey: "user_id",
		as: "user",
	});

	// User - Vehicle (1:N)
	User.hasMany(Vehicle, {
		foreignKey: "user_id",
		as: "vehicles",
		onDelete: "CASCADE",
		hooks: true,
	});
	Vehicle.belongsTo(User, {
		foreignKey: "user_id",
		as: "owner",
	});

	// Vehicle - TelemetryLog (1:N)
	Vehicle.hasMany(TelemetryLog, {
		foreignKey: "vehicle_id",
		as: "telemetryLogs",
		onDelete: "CASCADE",
		hooks: true,
	});
	TelemetryLog.belongsTo(Vehicle, {
		foreignKey: "vehicle_id",
		as: "vehicle",
	});
}
