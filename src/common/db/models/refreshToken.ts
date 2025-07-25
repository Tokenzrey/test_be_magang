import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../configs/database.config";

export interface RefreshTokenAttributes {
	id: number;
	token: string;
	user_id: number;
	expires_at: Date;
}
export interface RefreshTokenCreationAttributes
	extends Optional<RefreshTokenAttributes, "id"> {}

class RefreshToken
	extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
	implements RefreshTokenAttributes
{
	declare id: number;
	declare token: string;
	declare user_id: number;
	declare expires_at: Date;
}

RefreshToken.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		token: {
			type: DataTypes.STRING(512),
			allowNull: false,
			unique: true,
		},
		user_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			references: { model: "users", key: "id" },
			onDelete: "CASCADE",
		},
		expires_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "refresh_tokens",
		timestamps: false,
	}
);

export default RefreshToken;
