import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { cookie } from "@elysiajs/cookie";
import * as z from "zod";
import { prisma } from "./db/client";
import { cors } from "@elysiajs/cors";

const app = new Elysia({ prefix: "api/v1" })
    .use(cookie())
    .use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
    .use(
        openapi({
            mapJsonSchema: { zod: z.toJSONSchema },
        })
    )
    .get("/", () => "Hello Elysia")
    .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
