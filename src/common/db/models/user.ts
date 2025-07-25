import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../configs/database.config";

export interface UserAttributes {
	id: number;
	email: string;
	password: string;
	role: "USER" | "ADMIN";
}
export interface UserCreationAttributes
	extends Optional<UserAttributes, "id" | "role"> {}

class User
	extends Model<UserAttributes, UserCreationAttributes>
	implements UserAttributes
{
	declare id: number;
	declare email: string;
	declare password: string;
	declare role: "USER" | "ADMIN";
}

User.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
			validate: { isEmail: true },
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		role: {
			type: DataTypes.ENUM("USER", "ADMIN"),
			allowNull: false,
			defaultValue: "USER",
		},
	},
	{
		sequelize,
		tableName: "users",
		timestamps: false,
	}
);

export default User;
