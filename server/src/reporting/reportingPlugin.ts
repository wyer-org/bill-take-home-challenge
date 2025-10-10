import Elysia from "elysia";
import { cookie } from "@elysiajs/cookie";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { ReportingService } from "./reportingService";

const reportingService = new ReportingService();

export const reportingPlugin = new Elysia({ prefix: "/reporting" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie));
