import z from "zod";
import { User } from "@prisma/client";

export const RegisterUser = z.object({
    email: z.email(),
    name: z.string().min(1),
});

export type RegisterUserDto = z.infer<typeof RegisterUser>;

export const LoginUser = z.object({
    email: z.email(),
});

export type LoginUserDto = z.infer<typeof LoginUser>;

export const VerifyUser = LoginUser;
export type VerifyUserDto = z.infer<typeof VerifyUser>;

export const TokenQueryParams = z.object({
    token: z.uuidv4(),
});

export const UpdateUserProfile = z.object({
    userId: z.string().min(1),
    name: z.string().optional(),
    email: z.string().optional(),
});

export type UpdateUserProfileDto = {
    userId: string;
    name?: string;
    email?: string;
    updatedBy: User;
};
