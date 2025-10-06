import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import cookie from "@elysiajs/cookie";
import { TenantService } from "./tenantService";
import { CreateTenant } from "../common/types/tenant-team";

const tenantService = new TenantService();

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

                return status(201, { message: "Tenant created", data: tenant });
            } catch (error) {
                return status(400, { message: error.message });
            }
        },
        {
            body: CreateTenant,
        }
    )
    .get("/", async ({ status }) => {
        try {
            const tenants = await tenantService.getTenants();
            return { data: tenants };
        } catch (error) {
            return status(400, { message: error.message });
        }
    });
