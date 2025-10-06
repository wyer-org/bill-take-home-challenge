import { CreateTeamDto, GetTeamsByTenantDto } from "../common/types/tenant-team";
import { UserType } from "@prisma/client";
import { prisma } from "../db/client";

export class TeamService {
    async createTeam(data: CreateTeamDto) {
        const { name, tenantId, createdBy } = data;

        // todo: user must be verified => move to a middleware-ish
        if (!createdBy.isVerified) {
            throw new Error("User is not verified");
        }

        // todo: another middleware
        if (createdBy.userType !== UserType.ADMIN || createdBy.tenantId !== tenantId) {
            throw new Error("Unauthorized: Most be admin or belong to same tenant/organisation");
        }

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

    async getTeamsByTenant(data: GetTeamsByTenantDto) {
        const { currentUser, tenantId } = data;

        if (currentUser.userType !== "ADMIN" && currentUser.tenantId !== tenantId) {
            throw new Error("Unauthorized: Cannot view another tenant's teams");
        }

        const teams = prisma.team.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
        });

        return teams;
    }
}
