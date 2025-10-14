import { User } from "@prisma/client";
import {
    AssignUserToTeamDto,
    CreateTeamDto,
    DeleteTeamDto,
    GetTeamsForTenantDto,
} from "../common/types/tenant-team";
import { prisma } from "../db/client";
import {
    assertAdminOrTenant,
    assertAdminOrTeamMember,
    assertUserIsAdmin,
} from "../guards/assertions";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";

// todo add update and delete team
export class TeamService {
    async createTeam(data: CreateTeamDto) {
        const { name, tenantId, createdBy } = data;

        assertUserIsVerified({ user: createdBy });

        assertAdminOrTenant({ tenantId, user: createdBy });

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

        // only assign user to team created if they do not already belong to a team
        if (!createdBy.teamId) {
            await prisma.user.update({ where: { id: createdBy.id }, data: { teamId: team.id } });
        }

        return team;
    }

    async assignUserToTeam(data: AssignUserToTeamDto) {
        const { userId, teamId, assignedBy } = data;

        assertUserIsVerified({ user: assignedBy });

        assertAdminOrTeamMember({ user: assignedBy, teamId });

        const team = await prisma.team.findUnique({ where: { id: teamId } });

        if (!team) throw new Error("Team not found");

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) throw new Error("User not found");

        await prisma.user.update({
            where: { id: userId },
            data: { teamId, tenantId: assignedBy.tenantId },
        });

        return user;
    }

    async getTeamsForTenant(data: GetTeamsForTenantDto) {
        const { tenantId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        assertAdminOrTenant({ tenantId, user: currentUser });

        const teams = await prisma.team.findMany({
            where: { tenantId },
            include: { users: true, tenant: true },
        });

        return teams;
    }

    async getTeamById({ teamId, currentUser }: { teamId: string; currentUser: User }) {
        assertUserIsVerified({ user: currentUser });

        assertAdminOrTeamMember({ user: currentUser, teamId });

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                tenant: true,
                users: true,
            },
        });

        if (!team) {
            throw new Error("Team not found");
        }

        return team;
    }

    async updateTeam(data: { teamId: string; name?: string; updatedBy: User }) {
        const { teamId, name, updatedBy } = data;

        assertUserIsVerified({ user: updatedBy });

        assertAdminOrTeamMember({ user: updatedBy, teamId });

        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            throw new Error("Team not found");
        }

        if (name && name !== team.name) {
            const existingTeam = await prisma.team.findFirst({
                where: {
                    tenantId: team.tenantId,
                    name,
                    id: { not: teamId },
                },
            });

            if (existingTeam) {
                throw new Error("Team name already exists in this tenant");
            }
        }

        const updatedTeam = await prisma.team.update({
            where: { id: teamId },
            data: {
                ...(name && { name }),
            },
        });

        return updatedTeam;
    }

    async deleteTeam(data: DeleteTeamDto) {
        const { teamId, deletedBy } = data;

        assertUserIsVerified({ user: deletedBy });

        assertUserIsAdmin({ user: deletedBy });

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                users: true,
                groups: true,
            },
        });

        if (!team) {
            throw new Error("Team not found");
        }

        if (team.users.length > 0) {
            throw new Error(
                "Cannot delete team with existing users. Please remove all users first."
            );
        }

        if (team.groups.length > 0) {
            throw new Error(
                "Cannot delete team with existing groups. Please remove all groups first."
            );
        }

        await prisma.team.delete({
            where: { id: teamId },
        });

        return true;
    }
}
