import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";
import { UserService } from "./userService";

const userService = new UserService();

export const userPlugin = new Elysia({ prefix: "/user" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
    .get("/me", async ({ user, status }) => {
        if (!user) return status(401, { message: "Unauthorized" });

        const loggedInUser = await userService.getLoggedInUser({ user });

        if (!loggedInUser) return status(404, { message: "User not found" });

        return { data: loggedInUser };
    });
