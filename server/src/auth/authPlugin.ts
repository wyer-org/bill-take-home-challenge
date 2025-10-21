import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { LoginUser, RegisterUser, TokenQueryParams, VerifyUser } from "../common/types/user";
import { AuthService } from "./authService";
import { UserService } from "../user/userService";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";
import { prisma } from "../db/client";

const authService = new AuthService();
const userService = new UserService();

export const authPlugin = new Elysia({ prefix: "/auth" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
    // Register a new user
    .post(
        "/register",
        async ({ body, status }) => {
            const parsedBody = RegisterUser.parse(body);
            const { user, message, success } = await authService.registerUser(parsedBody);

            if (!user || !success) {
                return { success, data: null, message };
            }

            const authUrl = await authService.createUserMagicLink({ userId: user.id });

            return status(200, {
                message,
                success,
                authUrl,
            });
        },
        { body: RegisterUser }
    )
    // Initialte magic link for user login
    .post(
        "/login/init",
        async ({ body, status }) => {
            const user = await userService.getUserByEmail(body);

            if (!user) return { success: false, message: "User not found", data: null };

            if (!user?.isVerified)
                return { success: false, message: "User not verified, contact admin", data: null };

            const authUrl = await authService.createUserMagicLink({ userId: user.id });

            if (!authUrl) {
                return { success: false, message: "Error generating magic link", data: null };
            }

            return status(200, {
                message: "Login initialted successfully",
                success: true,
                authUrl,
            });
        },
        { body: LoginUser }
    )
    // Validate magic link and login user
    .post(
        "/login",
        async ({ query: { token }, cookie, status }) => {
            const { isValid, user, message } = await authService.validateMagicLink({ token });

            if (!isValid) return { success: false, message, user };

            if (!user) return { success: false, message, user };

            const session = await authService.createSession({ userId: user?.id });

            cookie.session.httpOnly = true;
            cookie.session.sameSite = "lax";
            cookie.session.path = "/";
            cookie.session.value = session.id;
            cookie.session.expires = session.expiresAt;

            await prisma.magicLink.update({ where: { id: token }, data: { isUsed: true } });

            return {
                success: isValid,
                message: "User loged in successfully",
                user,
            };
        },
        { query: TokenQueryParams }
    )
    // Logout user
    .post("/logout", async ({ cookie }) => {
        const sid = cookie.session.value as string;
        if (sid) await authService.removeSession({ sessionId: sid });

        cookie.session.remove();

        return {
            success: true,
            message: "Logout successfully",
        };
    });
