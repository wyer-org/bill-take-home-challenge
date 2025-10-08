import cookie from "@elysiajs/cookie";
import Elysia from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { RoleService } from "./roleService";
import { AssignRoleToGroup, RemoveRoleFromGroup } from "../common/types/roles";

const roleService = new RoleService();

export const rolePlugin = new Elysia({ prefix: "/role" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
    // Create role with permissions
    .post("/", async ({ body, user, status }) => {})
    // assign role to group
    .post(
        "/:roleId/group/:groupId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });
                const groupRole = await roleService.assignRoleToGroup({
                    groupId: params.groupId,
                    roleId: params.roleId,
                    assignedBy: user,
                });

                return status(201, {
                    message: "Role assigned to group successfully",
                    data: groupRole,
                });
            } catch (error: any) {
                return status(400, {
                    message: error.message ?? "An error occurred",
                });
            }
        },
        { params: AssignRoleToGroup }
    )
    // remove role from group
    .delete(
        "/:roleId/group/:groupId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });
                const result = await roleService.removeRoleFromGroup({
                    roleId: params.roleId,
                    groupId: params.groupId,
                    removedBy: user,
                });
                return status(200, { message: result.message, data: result });
            } catch (error: any) {
                return status(400, {
                    message: error.message ?? "An error occurred",
                });
            }
        },
        {
            params: RemoveRoleFromGroup,
        }
    );
