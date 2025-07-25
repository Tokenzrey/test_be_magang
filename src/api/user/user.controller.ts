import { Request, Response } from "express";
import { userService } from "./user.service";
import { verifyAccessToken } from "@/common/utils/jwtToken";

class UserController {
	getUsers = async (_req: Request, res: Response) => {
		const result = await userService.findAll();
		res.status(result.statusCode).json(result);
	};

	getUser = async (req: Request, res: Response) => {
		const accessToken = (req.headers["authorization"] as string)?.replace(
			"Bearer ",
			""
		);
		let requester: { id: number; role: string } | null = null;

		try {
			requester = verifyAccessToken(accessToken);
		} catch {
			return res.status(401).json({
				status: "error",
				message: "Invalid or expired access token.",
			});
		}

		let targetId: number;

		if (requester.role === "ADMIN") {
			// Admin: if query param id is given, use it; else, use own id
			targetId = req.params.id ? Number(req.params.id) : requester.id;
		} else {
			// User: always use id from token, ignore query param id
			targetId = requester.id;
		}

		const result = await userService.findById(targetId);
		res.status(result.statusCode).json(result);
	};

	createUser = async (req: Request, res: Response) => {
		const { email, password, role } = req.body;
		const result = await userService.create({ email, password, role });
		res.status(result.statusCode).json(result);
	};

	updateUser = async (req: Request, res: Response) => {
		const accessToken = (req.headers["authorization"] as string)?.replace(
			"Bearer ",
			""
		);
		let requester: { id: number; role: string } | null = null;

		try {
			requester = verifyAccessToken(accessToken);
		} catch {
			return res.status(401).json({
				status: "error",
				message: "Invalid or expired access token.",
			});
		}

		let targetId: number;

		if (requester.role === "ADMIN") {
			// Admin: if query param id is given, use it; else, update own data
			targetId = req.params.id ? Number(req.params.id) : requester.id;
		} else {
			// User: always update own data, ignore query param id
			targetId = requester.id;
		}

		// Only admin can update role
		let { email, password, role } = req.body;
		if (requester.role !== "ADMIN") {
			role = undefined; // Prevent user from updating their own role
		}

		const result = await userService.update(targetId, {
			email,
			password,
			role,
		});
		res.status(result.statusCode).json(result);
	};

	deleteUser = async (req: Request, res: Response) => {
		const id = Number(req.params.id);
		const result = await userService.delete(id);
		res.status(result.statusCode).json(result);
	};
}

export const userController = new UserController();
