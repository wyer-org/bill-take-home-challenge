import cookie from "@elysiajs/cookie";
import Elysia from "elysia";
import { z } from "zod";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { GroupService } from "./groupService";
import { CreateGroup, UpdateGroup, AddUserToGroup, GetGroupRoles } from "../common/types/group";

const groupService = new GroupService();

export const groupPlugin = new Elysia({ prefix: "/group" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
    // create a group
    .post(
        "/",
        async ({ body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const group = await groupService.createGroup({
                    ...body,
                    createdBy: user,
                });

                return status(201, {
                    message: "Group created successfully",
                    data: group,
                });
            } catch (error) {
                return status(400, {
                    message: error instanceof Error ? error.message : "An error occurred",
                });
            }
        },
        {
            body: CreateGroup,
        }
    )
    // update a group
    .put(
        "/:groupId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const group = await groupService.updateGroup({
                    groupId: params.groupId,
                    ...body,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Group updated successfully",
                    data: group,
                });
            } catch (error) {
                return status(400, {
                    message: error instanceof Error ? error.message : "An error occurred",
                });
            }
        },
        {
            params: z.object({ groupId: z.string() }),
            body: UpdateGroup,
        }
    )
    // get all groups of a team
    .get(
        "/team/:teamId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const groups = await groupService.getGroupsByTeam({
                    teamId: params.teamId,
                    currentUser: user,
                });

                return status(200, { data: groups });
            } catch (error) {
                return status(400, {
                    message: error instanceof Error ? error.message : "An error occurred",
                });
            }
        },
        {
            params: z.object({ teamId: z.string() }),
        }
    )
    // add a user to a group
    .post(
        "/:groupId/user",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const userGroup = await groupService.addUserToGroup({
                    groupId: params.groupId,
                    ...body,
                    addedBy: user,
                });

                return status(201, {
                    message: "User added to group successfully",
                    data: userGroup,
                });
            } catch (error) {
                return status(400, {
                    message: error instanceof Error ? error.message : "An error occurred",
                });
            }
        },
        {
            params: z.object({ groupId: z.string() }),
            body: AddUserToGroup,
        }
    )
    // remove a user from a group
    .delete(
        "/:groupId/user/:userId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await groupService.removeUserFromGroup({
                    groupId: params.groupId,
                    userId: params.userId,
                    removedBy: user,
                });

                return status(200, {
                    message: "User removed from group successfully",
                });
            } catch (error) {
                return status(400, {
                    message: error instanceof Error ? error.message : "An error occurred",
                });
            }
        },
        {
            params: z.object({
                groupId: z.string(),
                userId: z.string(),
            }),
        }
    )
    // get all members of a group
    .get(
        "/:groupId/members",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const members = await groupService.getGroupMembers({
                    groupId: params.groupId,
                    currentUser: user,
                });

                return status(200, { data: members });
            } catch (error) {
                return status(400, {
                    message: error instanceof Error ? error.message : "An error occurred",
                });
            }
        },
        {
            params: z.object({ groupId: z.string() }),
        }
    )
    // get all roles of a group
    .get(
        "/:groupId/roles",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const groupRoles = await groupService.getGroupRoles({
                    groupId: params.groupId,
                    currentUser: user,
                });

                return status(200, {
                    message: "Group roles fetched successfully",
                    data: groupRoles,
                });
            } catch (error: any) {
                return status(400, {
                    message: error.message ?? "An error occurred",
                });
            }
        },
        { params: GetGroupRoles }
    )
    // delete a group
    .delete(
        "/:groupId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await groupService.deleteGroup({
                    groupId: params.groupId,
                    deletedBy: user,
                });

                return status(200, {
                    message: result.message,
                    data: result,
                });
            } catch (error) {
                return status(400, {
                    message: error instanceof Error ? error.message : "An error occurred",
                });
            }
        },
        {
            params: z.object({ groupId: z.string() }),
        }
    );
