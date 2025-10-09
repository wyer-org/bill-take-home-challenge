import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";
import { UserService } from "./userService";
import { UpdateUserProfile } from "../common/types/user";
import { z } from "zod";

const userService = new UserService();

export const userPlugin = new Elysia({ prefix: "/user" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))

    // Get logged in user profile
    .get("/profile", async ({ user, status }) => {
        if (!user) return status(401, { message: "Unauthorized" });

        const loggedInUser = await userService.getUserProfile({ user });

        if (!loggedInUser) return status(404, { message: "User not found" });

        return { data: loggedInUser };
    })

    // Get all users in tenant (admin only)
    .get(
        "/tenant/:tenantId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const users = await userService.getAllUsers({
                    tenantId: params.tenantId,
                    currentUser: user,
                });

                return status(200, { data: users });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: z.object({ tenantId: z.string() }),
        }
    )

    // Update user profile
    .put(
        "/profile",
        async ({ body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedUser = await userService.updateUserProfile({
                    userId: body.userId,
                    name: body.name,
                    email: body.email,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Profile updated successfully",
                    data: updatedUser,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            body: UpdateUserProfile,
        }
    )

    // Update user by ID (admin only)
    .put(
        "/:userId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedUser = await userService.updateUserProfile({
                    userId: params.userId,
                    name: body.name,
                    email: body.email,
                    updatedBy: user,
                });

                return status(200, {
                    message: "User updated successfully",
                    data: updatedUser,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: z.object({ userId: z.string() }),
            body: UpdateUserProfile,
        }
    )

    // Update user tenant (admin only)
    .put(
        "/:userId/tenant",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedUser = await userService.updateUserTenant({
                    userId: params.userId,
                    tenantId: body.tenantId,
                    updatedBy: user,
                });

                return status(200, {
                    message: "User tenant updated successfully",
                    data: updatedUser,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: z.object({ userId: z.string() }),
            body: z.object({ tenantId: z.string() }),
        }
    )

    // Delete user (admin only)
    .delete(
        "/:userId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await userService.deleteUser({
                    userId: params.userId,
                    deletedBy: user,
                });

                return status(200, {
                    message: "User deleted successfully",
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: z.object({ userId: z.string() }),
        }
    );
