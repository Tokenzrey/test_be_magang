import UserModel from "@/common/db/models/user";
import { hashPassword } from "@/common/utils/hashPassword";

export class UserRepository {
	async findAll(): Promise<UserModel[]> {
		return UserModel.findAll();
	}

	async findById(id: number): Promise<UserModel | null> {
		return UserModel.findByPk(id);
	}

	async create(data: {
		email: string;
		password: string;
		role?: "USER" | "ADMIN";
	}) {
		const hashed = await hashPassword(data.password);
		return UserModel.create({
			email: data.email,
			password: hashed,
			role: data.role || "USER",
		});
	}

	async update(
		id: number,
		data: { email?: string; password?: string; role?: "USER" | "ADMIN" }
	): Promise<UserModel | null> {
		const user = await UserModel.findByPk(id);
		if (!user) return null;
		if (data.email !== undefined) user.email = data.email;
		if (data.password !== undefined)
			user.password = await hashPassword(data.password);
		if (data.role !== undefined) user.role = data.role;
		await user.save();
		return user;
	}

	async delete(id: number): Promise<boolean> {
		const count = await UserModel.destroy({ where: { id } });
		return count > 0;
	}
}
