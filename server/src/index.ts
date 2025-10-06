import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { cookie } from "@elysiajs/cookie";
import * as z from "zod";
import { cors } from "@elysiajs/cors";
import { authPlugin } from "./auth/authPlugin";
import { userPlugin } from "./user/userPlugin";
import { teamPlugin } from "./teams/teamPlugin";
import { tenantPlugin } from "./tenants/tenantPlugin";

const app = new Elysia({ prefix: "api/v1" })
    .use(cookie())
    .use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
    .use(
        openapi({
            mapJsonSchema: { zod: z.toJSONSchema },
        })
    )
    .use(authPlugin)
    .use(userPlugin)
    .use(teamPlugin)
    .use(tenantPlugin)
    .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
