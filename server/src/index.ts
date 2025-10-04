import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { cookie } from "@elysiajs/cookie";
import * as z from "zod";
import { prisma } from "./db/client";
import { TestInputCreate, TestPlain } from "./db/generated/Test";
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
    .post(
        "/test",
        async ({ body }) => {
            return await prisma.test.create({ data: body });
        },
        { body: TestInputCreate, response: TestPlain }
    )
    .get(
        "test",
        async () => {
            return await prisma.test.findMany();
        },
        { response: [TestPlain] }
    )
    .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
