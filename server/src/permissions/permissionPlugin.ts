import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";
import { PermissionService } from "./permissionService";
import { CreatePermission, PermissionIdParams, UpdatePermission } from "../common/types/permission";
import { z } from "zod";

const permissionService = new PermissionService();

export const permissionPlugin = new Elysia({ prefix: "/permission" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))

    // Create permission
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
    })

    // Get individual permission
    .get(
        "/:permissionId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const permission = await permissionService.getPermissionById(
                    params.permissionId,
                    user
                );

                return status(200, { data: permission });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: PermissionIdParams,
        }
    )

    // Update permission
    .put(
        "/:permissionId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedPermission = await permissionService.updatePermission({
                    permissionId: params.permissionId,
                    name: body.name,
                    description: body.description,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Permission updated successfully",
                    data: updatedPermission,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: PermissionIdParams,
            body: UpdatePermission,
        }
    )

    // Delete permission
    .delete(
        "/:permissionId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await permissionService.deletePermission(params.permissionId, user);

                return status(200, {
                    message: "Permission deleted successfully",
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: PermissionIdParams,
        }
    );
