import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const UserRoleEnum = z.enum(["USER", "ADMIN"]);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	id: z.number(),
	email: z.string().email(),
	role: UserRoleEnum,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
	body: z.object({
		email: commonValidations.email,
		password: commonValidations.password,
		role: UserRoleEnum.optional(),
	}),
});

export const UpdateUserSchema = z.object({
	body: z.object({
		email: commonValidations.email.optional(),
		password: commonValidations.password.optional(),
		role: UserRoleEnum.optional(),
	}),
	params: z.object({
		id: commonValidations.id,
	}),
});

export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

export const DeleteUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});
