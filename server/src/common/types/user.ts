import z from "zod";

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
