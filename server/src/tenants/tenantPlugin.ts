import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import cookie from "@elysiajs/cookie";
import { TenantService } from "./tenantService";
import {
    AssignUserToTenant,
    CreateTenant,
    RemoveUserFromTenant,
    DeleteTenant,
    TenantIdParams,
    UpdateTenantBody,
    GetTenantUsersParams,
} from "../common/types/tenant-team";

const tenantService = new TenantService();

export const tenantPlugin = new Elysia({ prefix: "/tenant" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))

    // Create tenant
    .post(
        "/",
        async ({ user, body, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const { message, success, tenant } = await tenantService.createTenant({
                    name: body.name,
                    createdBy: user,
                });

                return status(201, { message, success, tenant });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            body: CreateTenant,
        }
    )

    // Get all tenants
    .get("/", async ({ status, user }) => {
        try {
            if (!user) return status(401, { message: "Unauthorized" });

            const tenants = await tenantService.getTenants({ currentUser: user });

            return status(200, { success: true, message: "Tenants fetched successfully", tenants });
        } catch (error: any) {
            return status(400, { message: error.message });
        }
    })

    // Get individual tenant
    .get(
        "/:tenantId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const tenant = await tenantService.getTenantById(params.tenantId, user);

                return status(200, { data: tenant });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TenantIdParams,
        }
    )

    // Update tenant
    .put(
        "/:tenantId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedTenant = await tenantService.updateTenant({
                    tenantId: params.tenantId,
                    ...body,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Tenant updated successfully",
                    data: updatedTenant,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TenantIdParams,
            body: UpdateTenantBody,
        }
    )

    // Assign user to tenant
    .post(
        "/:tenantId/:userId/assign",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await tenantService.assignUserToTenant({
                    userId: params.userId,
                    tenantId: params.tenantId,
                    assignedBy: user,
                });

                return status(200, { ...result });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: AssignUserToTenant,
        }
    )
    // Get all users in tenant (admin only)
    .get(
        "/users/:tenantId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await tenantService.getTenantUsers({
                    tenantId: params.tenantId,
                    currentUser: user,
                });

                return status(200, { data: result });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: GetTenantUsersParams,
        }
    )

    // Remove user from tenant
    .post(
        "/:tenantId/:userId/remove",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });
                const removedUser = await tenantService.removeUserFromTenant({
                    userId: params.userId,
                    tenantId: params.tenantId,
                    removedBy: user,
                });
                return status(200, {
                    message: "User removed from tenant successfully",
                    data: removedUser,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: RemoveUserFromTenant,
        }
    )

    // Delete tenant
    .delete(
        "/:tenantId/delete",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await tenantService.deleteTenant({
                    tenantId: params.tenantId,
                    deletedBy: user,
                });

                return status(200, { ...result });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: DeleteTenant,
        }
    );
