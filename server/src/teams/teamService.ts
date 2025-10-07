import { CreateTeamDto, GetTeamsByTenantDto } from "../common/types/tenant-team";
import { prisma } from "../db/client";
import { assertAdminAndTenant } from "../guards/assertAdminAndTenant";
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

        if (existingTeam) throw new Error("Team name already exists in this tenant");

        const team = await prisma.team.create({
            data: {
                name,
                tenantId,
            },
        });

        return team;
    }
}
