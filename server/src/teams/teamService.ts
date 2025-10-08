import {
    CreateTeamDto,
    GetTeamsByTenantDto,
    GetTeamsForTenantDto,
} from "../common/types/tenant-team";
import { prisma } from "../db/client";
import { assertAdminAndTenant } from "../guards/assertions";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";

// todo add update and delete team
export class TeamService {
    async createTeam(data: CreateTeamDto) {
        const { name, tenantId, createdBy } = data;

        assertUserIsVerified({ user: createdBy });

        assertAdminAndTenant({ tenantId, user: createdBy });

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) throw new Error("Tenant not found");

        const existingTeam = await prisma.team.findFirst({ where: { tenantId, name } });

        if (existingTeam) throw new Error("Team name already exists in this tenant/organisation");

        const team = await prisma.team.create({
            data: {
                name,
                tenantId,
            },
        });

        await prisma.user.update({ where: { id: createdBy.id }, data: { teamId: team.id } });

        return team;
    }

    async getTeamsForTenant(data: GetTeamsForTenantDto) {
        const { tenantId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        assertAdminAndTenant({ tenantId, user: currentUser });

        const teams = await prisma.team.findMany({ where: { tenantId } });

        return teams;
    }
}
