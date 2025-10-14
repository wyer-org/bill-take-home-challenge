import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";
import { PermissionService } from "./permissionService";

const permissionService = new PermissionService();

export const permissionPlugin = new Elysia({ prefix: "/permission" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))

    // Seed all permissions
    .post("/seed", async ({ user, status }) => {
        try {
            if (!user) return status(401, { message: "Unauthorized" });

            const permissions = await permissionService.seedAdminPermissions({
                createdBy: user,
            });

            return status(201, {
                message: "Permissions seeded successfully",
                data: permissions,
            });
        } catch (error: any) {
            return status(400, {
                message: error.message ?? "An error occurred",
            });
        }
    })

    // Get all permissions
    .get("/", async ({ user, status }) => {
        try {
            if (!user) return status(401, { message: "Unauthorized" });
            const permissions = await permissionService.getPermissions();

            return status(200, {
                message: "Permissions fetched successfully",
                data: permissions,
            });
        } catch (error: any) {
            return status(400, {
                message: error.message ?? "An error occurred",
            });
        }
    });
