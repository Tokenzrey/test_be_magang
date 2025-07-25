import { StatusCodes } from "http-status-codes";
import { UserRepository } from "./user.repository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { logger } from "@/server";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}

	async findAll() {
		try {
			const users = await this.userRepository.findAll();
			return ServiceResponse.success(
				"Users found",
				users.map((u) => ({
					id: u.id,
					email: u.email,
					role: u.role,
					createdAt: (u as any).createdAt,
					updatedAt: (u as any).updatedAt,
				}))
			);
		} catch (ex) {
			logger.error(`Error finding all users: ${(ex as Error).message}`);
			return ServiceResponse.failure(
				"An error occurred while retrieving users.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async findById(id: number) {
		try {
			const user = await this.userRepository.findById(id);
			if (!user) {
				return ServiceResponse.failure(
					"User not found",
					null,
					StatusCodes.NOT_FOUND
				);
			}
			return ServiceResponse.success("User found", {
				id: user.id,
				email: user.email,
				role: user.role,
				createdAt: (user as any).createdAt,
				updatedAt: (user as any).updatedAt,
			});
		} catch (ex) {
			logger.error(
				`Error finding user with id ${id}: ${(ex as Error).message}`
			);
			return ServiceResponse.failure(
				"An error occurred while finding user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async create(data: {
		email: string;
		password: string;
		role?: "USER" | "ADMIN";
	}) {
		try {
			const existing = await this.userRepository.findAll();
			if (existing.some((u) => u.email === data.email)) {
				return ServiceResponse.failure(
					"Email already exists.",
					null,
					StatusCodes.CONFLICT
				);
			}
			const user = await this.userRepository.create(data);
			return ServiceResponse.success(
				"User created",
				{
					id: user.id,
					email: user.email,
					role: user.role,
					createdAt: (user as any).createdAt,
					updatedAt: (user as any).updatedAt,
				},
				StatusCodes.CREATED
			);
		} catch (ex) {
			logger.error(`Error creating user: ${(ex as Error).message}`);
			return ServiceResponse.failure(
				"An error occurred while creating user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async update(
		id: number,
		data: { email?: string; password?: string; role?: "USER" | "ADMIN" }
	) {
		try {
			const user = await this.userRepository.update(id, data);
			if (!user) {
				return ServiceResponse.failure(
					"User not found",
					null,
					StatusCodes.NOT_FOUND
				);
			}
			return ServiceResponse.success("User updated", {
				id: user.id,
				email: user.email,
				role: user.role,
				createdAt: (user as any).createdAt,
				updatedAt: (user as any).updatedAt,
			});
		} catch (ex) {
			logger.error(
				`Error updating user with id ${id}: ${(ex as Error).message}`
			);
			return ServiceResponse.failure(
				"An error occurred while updating user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async delete(id: number) {
		try {
			const deleted = await this.userRepository.delete(id);
			if (!deleted) {
				return ServiceResponse.failure(
					"User not found",
					null,
					StatusCodes.NOT_FOUND
				);
			}
			return ServiceResponse.success("User deleted", null);
		} catch (ex) {
			logger.error(
				`Error deleting user with id ${id}: ${(ex as Error).message}`
			);
			return ServiceResponse.failure(
				"An error occurred while deleting user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}
}

export const userService = new UserService();
