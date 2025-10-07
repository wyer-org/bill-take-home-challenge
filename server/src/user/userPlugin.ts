import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";

export const userPlugin = new Elysia({ prefix: "/user" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
    .get("/me", async ({ user, status }) => {
        if (!user) return status(401, { message: "Unauthorized" });
        return { user };
    });
