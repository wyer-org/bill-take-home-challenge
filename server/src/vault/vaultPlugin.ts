import Elysia from "elysia";
import { cookie } from "@elysiajs/cookie";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { VaultService } from "./vaultService";

const vaultService = new VaultService();

export const vaultPlugin = new Elysia({ prefix: "/vault" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie));
