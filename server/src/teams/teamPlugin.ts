import cookie from "@elysiajs/cookie";
import Elysia from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { TeamService } from "./teamService";
import { CreateTeam, GetTeamsByTentantParams } from "../common/types/tenant-team";

const teamService = new TeamService();

// todo add update and delete team
export const teamPlugin = new Elysia({ prefix: "/team" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))
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
            params: GetTeamsByTentantParams,
        }
    );
