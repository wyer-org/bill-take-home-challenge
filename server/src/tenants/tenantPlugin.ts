import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import cookie from "@elysiajs/cookie";
import { TenantService } from "./tenantService";
import {
    AssignUserToTenant,
    CreateTenant,
    RemoveUserFromTenant,
    DeleteTenant,
} from "../common/types/tenant-team";

const tenantService = new TenantService();

// todo add update and delete tenant
export const tenantPlugin = new Elysia({ prefix: "/tenant" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
    .post(
        "/",
        async ({ user, body, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorezed" });

                const tenant = await tenantService.createTenant({
                    name: body.name,
                    createdBy: user,
                });

                return status(201, { message: "Tenant created successfully", data: tenant });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            body: CreateTenant,
        }
    )
    .get("/", async ({ status, user }) => {
        try {
            if (!user) return status(401, { message: "Unauthorized" });

            const tenants = await tenantService.getTenants({ currentUser: user });

            return status(200, { message: "Tenants fetched successfully", data: tenants });
        } catch (error: any) {
            return status(400, { message: error.message });
        }
    })
    .post(
        "/:tenantId/:userId/assign",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });
                const assignedUser = await tenantService.assignUserToTenant({
                    userId: params.userId,
                    tenantId: params.tenantId,
                    assignedBy: user,
                });
                return status(200, {
                    message: "User assigned to tenant successfully",
                    data: assignedUser,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: AssignUserToTenant,
        }
    )
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
    .post(
        "/:tenantId/delete",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const deletedTenant = await tenantService.deleteTenant({
                    tenantId: params.tenantId,
                    deletedBy: user,
                });
                return status(200, { message: "Tenant deleted successfully", data: deletedTenant });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: DeleteTenant,
        }
    );
