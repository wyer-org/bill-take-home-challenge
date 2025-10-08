import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";
import { PermissionService } from "./permissionService";
import { CreatePermission } from "../common/types/permission";

const permissionService = new PermissionService();

export const permissionPlugin = new Elysia({ prefix: "/permission" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
    .post(
        "/create",
        async ({ body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });
                const permission = await permissionService.createPermission({
                    ...body,
                    createdBy: user,
                    description: body.description ?? "",
                });

                return status(201, {
                    message: "Permission created successfully",
                    data: permission,
                });
            } catch (error: any) {
                return status(400, {
                    message: error.message ?? "An error occurred",
                });
            }
        },
        {
            body: CreatePermission,
        }
    )
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
