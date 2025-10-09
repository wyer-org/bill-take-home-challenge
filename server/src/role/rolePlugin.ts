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
    UpdateRole,
    DeleteRole,
    AddPermissionsToRole,
    RemovePermissionsFromRole,
} from "../common/types/roles";
import { z } from "zod";

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

    // Get roles by group
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

    // Get individual role
    .get(
        "/:roleId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const role = await roleService.getRoleById({
                    roleId: params.roleId,
                    currentUser: user,
                });

                return status(200, { data: role });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: z.object({ roleId: z.string() }),
        }
    )

    // Update role
    .put(
        "/:roleId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedRole = await roleService.updateRole({
                    roleId: params.roleId,
                    name: body.name,
                    description: body.description,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Role updated successfully",
                    data: updatedRole,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: z.object({ roleId: z.string() }),
            body: UpdateRole,
        }
    )

    // Delete role
    .delete(
        "/:roleId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await roleService.deleteRole({
                    roleId: params.roleId,
                    deletedBy: user,
                });

                return status(200, {
                    message: "Role deleted successfully",
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: DeleteRole,
        }
    )

    // Assign role to group
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

    // Remove role from group
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
    )

    // Add permissions to role
    .post(
        "/:roleId/permissions",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await roleService.addPermissionsToRole({
                    roleId: params.roleId,
                    permissionIds: body.permissionIds,
                    addedBy: user,
                });

                return status(200, {
                    message: result.message,
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: z.object({ roleId: z.string() }),
            body: AddPermissionsToRole,
        }
    )

    // Remove permissions from role
    .delete(
        "/:roleId/permissions",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await roleService.removePermissionsFromRole({
                    roleId: params.roleId,
                    permissionIds: body.permissionIds,
                    removedBy: user,
                });

                return status(200, {
                    message: result.message,
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: z.object({ roleId: z.string() }),
            body: RemovePermissionsFromRole,
        }
    );
