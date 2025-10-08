import { User, UserType } from "@prisma/client";
import { prisma } from "../db/client";

export function assertAdminAndTenant({ tenantId, user }: { user: User; tenantId: string }) {
    if (user.userType === UserType.ADMIN) {
        return;
    }

    if (user.userType === UserType.USER && user.tenantId === tenantId) {
        return;
    }

    throw new Error("Unauthorized: Must be admin or belong to the same tenant");
}

export function assertAdmin(user: User) {
    if (user.userType === UserType.ADMIN) {
        return;
    }
    throw new Error("Unauthorized: Must be admin");
}

export function assertAdminOrTeamMember({ user, teamId }: { user: User; teamId: string }) {
    if (user.userType === UserType.ADMIN) {
        return;
    }

    if (user.userType === UserType.USER && user.teamId === teamId) {
        return;
    }

    throw new Error("Unauthorized: Must be admin or team member");
}

export async function assertCanManageTeamGroups(user: User, teamId: string) {
    assertAdminOrTeamMember({ user, teamId });

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { users: true },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    const isTeamMember = team.users.some((teamUser) => teamUser.teamId === teamId);

    if (!isTeamMember) {
        throw new Error("Unauthorized: Must be admin or team member to manage groups");
    }
}
