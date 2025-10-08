import cookie from "@elysiajs/cookie";
import Elysia from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { RoleService } from "./roleService";
import {
    AssignRoleToGroupParams,
    CreateRoleForGroup,
    CreateRoleForGroupParams,
    GetRolesByGroup,
    RemoveRoleFromGroup,
} from "../common/types/roles";

const roleService = new RoleService();

export const rolePlugin = new Elysia({ prefix: "/role" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
    // Create role for group with permissions
    .post(
        "/group/:groupId",
        async ({ body, user, status, params }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });
                const result = await roleService.createRoleForGroup({
                    ...body,
                    createdBy: user,
                    groupId: params.groupId,
                    description: body.description ?? "",
                });
                return status(201, {
                    message: "Role created and assigned to group successfully",
                    data: result,
                });
            } catch (error: any) {
                console.log(error);
                return status(400, {
                    message: error.message ?? "An error occurred",
                });
            }
        },
        { body: CreateRoleForGroup, params: CreateRoleForGroupParams }
    )
    // get roles by for a given group
    .get(
        "/group/:groupId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });
                const roles = await roleService.getRolesByGroup({
                    groupId: params.groupId,
                    currentUser: user,
                });
                return status(200, { message: "Roles fetched successfully", data: roles });
            } catch (error: any) {
                return status(400, {
                    message: error.message ?? "An error occurred",
                });
            }
        },
        { params: GetRolesByGroup }
    )
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
        { params: AssignRoleToGroupParams }
    )
    // remove role from group
    .delete(
        "/:roleId/group/:groupId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                await roleService.removeRoleFromGroup({
                    roleId: params.roleId,
                    groupId: params.groupId,
                    removedBy: user,
                });

                return status(200, {
                    message: "Role removed from group successfully",
                    data: true,
                });
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
