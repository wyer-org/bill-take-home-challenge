import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { LoginUser, RegisterUser, TokenQueryParams, VerifyUser } from "../common/types/user";
import { AuthService } from "./authService";
import { UserService } from "../user/userService";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";

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
            const user = await authService.registerUser(parsedBody);

            if (!user) {
                return status(400, {
                    message: "User already exists",
                    data: null,
                });
            }

            const authUrl = await authService.createUserMagicLink({ userId: user.id });

            return status(200, {
                message: "Register successfull",
                data: {
                    user,
                    authUrl,
                },
            });
        },
        { body: RegisterUser }
    )
    // Initialte magic link for user login
    .post(
        "/login/init",
        async ({ body, status }) => {
            const user = await userService.getUserByEmail(body);

            if (!user) return status(404, { message: "User not found", data: null });

            if (!user?.isVerified)
                return status(401, { message: "User not verified, contact admin" });

            const authUrl = await authService.createUserMagicLink({ userId: user.id });

            return status(200, {
                message: "Login initialted successfully",
                data: {
                    user,
                    authUrl,
                },
            });
        },
        { body: LoginUser }
    )
    // Validate magic link and login user
    .post(
        "/login",
        async ({ query: { token }, cookie, status }) => {
            const { isValid, user } = await authService.validateMagicLink({ token });

            if (!isValid || !user) return status(401, { message: "Unauthorized: contact admin" });

            const session = await authService.createSession({ userId: user?.id });

            cookie.session.value = session.id;
            cookie.session.httpOnly = process.env.NODE_ENV === "development";
            cookie.session.expires = session.expiresAt;

            return {
                success: true,
                message: "User loged in successfully",
                data: user,
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
    })
    // Verify user by admin
    .post(
        "/verify-user",
        async ({ user, status, body }) => {
            if (!user) return status(401, { message: "Unauthorized" });

            const { isAdmin } = await authService.validateIsUserAdmin(user);

            if (!isAdmin) return status(401, { message: "Unauthorized." });

            const { isVerified, user: verifiedUser } = await authService.verifyUserByAdmin({
                email: body.email,
                isVerifiedByAdmin: isAdmin,
            });

            if (!isVerified) return status(400, { message: "User not verified" });

            return { isVerified, user: verifiedUser };
        },
        { body: VerifyUser }
    );
