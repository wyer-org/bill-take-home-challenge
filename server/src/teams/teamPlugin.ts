import cookie from "@elysiajs/cookie";
import Elysia from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { TeamService } from "./teamService";
import {
    CreateTeam,
    TeamIdParams,
    TenantIdParams,
    UpdateTeamBody,
} from "../common/types/tenant-team";

const teamService = new TeamService();

export const teamPlugin = new Elysia({ prefix: "/team" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))

    // Create team
    .post(
        "/",
        async ({ body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const team = await teamService.createTeam({ ...body, createdBy: user });

                return status(201, { message: "Team created successfully", data: team });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            body: CreateTeam,
        }
    )

    // Get teams by tenant
    .get(
        "/:tenantId",
        async ({ params, status, user }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const teams = await teamService.getTeamsForTenant({
                    tenantId: params.tenantId,
                    currentUser: user,
                });

                return status(200, { data: teams });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TenantIdParams,
        }
    )

    // Get individual team
    .get(
        "/:teamId/details",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const team = await teamService.getTeamById({
                    teamId: params.teamId,
                    currentUser: user,
                });

                return status(200, { data: team });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TeamIdParams,
        }
    )

    // Update team
    .put(
        "/:teamId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedTeam = await teamService.updateTeam({
                    teamId: params.teamId,
                    ...body,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Team updated successfully",
                    data: updatedTeam,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TeamIdParams,
            body: UpdateTeamBody,
        }
    )

    // Delete team
    .delete(
        "/:teamId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await teamService.deleteTeam({
                    teamId: params.teamId,
                    deletedBy: user,
                });

                return status(200, {
                    message: "Team deleted successfully",
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TeamIdParams,
        }
    );
