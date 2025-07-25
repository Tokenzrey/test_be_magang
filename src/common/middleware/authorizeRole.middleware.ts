import { Request, Response, NextFunction } from "express";
import { ServiceResponse } from "@/common/utils/serviceResponse";

export function authorizeRole(...roles: string[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as any).user;
		if (!user || !roles.includes(user.role)) {
			return res
				.status(403)
				.json(
					ServiceResponse.failure("Forbidden: insufficient role.", null, 403)
				);
		}
		next();
	};
}

// Usage: router.get("/admin", authenticateToken, authorizeRole("ADMIN"), handler)
