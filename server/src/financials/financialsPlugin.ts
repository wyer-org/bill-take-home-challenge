import Elysia from "elysia";
import { cookie } from "@elysiajs/cookie";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { FinancialsService } from "./financialsService";

const financialsService = new FinancialsService();

export const financialsPlugin = new Elysia({ prefix: "/financials" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie));
