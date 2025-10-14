import { Action, Module, User, UserType } from "@prisma/client";
import { prisma } from "../db/client";

export function assertAdminOrTenant({ tenantId, user }: { user: User; tenantId: string }) {
    if (user.userType === UserType.ADMIN) {
        return;
    }

    if (user.userType === UserType.USER && user.tenantId === tenantId) {
        return;
    }

    throw new Error("Unauthorized: Must be admin or belong to the same tenant");
}

export function assertUserIsAdmin({ user }: { user: User }) {
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

export async function assertCanManageTeamGroups(user: User, teamId?: string) {
    if (!teamId) {
        throw new Error("Team ID is required");
    }

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

export async function assertUserHasPermissionInGroup(
    user: User,
    groupId: string,
    module: Module,
    action: Action
) {
    if (user.userType === UserType.ADMIN) {
        return; // Admins have all permissions
    }

    // Check if user belongs to the group and has the required permission through their roles
    const hasPermission = await prisma.userGroup.findFirst({
        where: {
            userId: user.id,
            groupId: groupId,
            group: {
                groupRoles: {
                    some: {
                        rolePermissions: {
                            some: {
                                permission: {
                                    module: module,
                                    action: action,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!hasPermission) {
        throw new Error(`Unauthorized: Missing ${action} permission for ${module} in this group`);
    }
}

export async function assertUserBelongsToGroupOrIsAdmin({
    userId,
    groupId,
}: {
    userId: string;
    groupId: string;
}) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user?.userType === UserType.ADMIN) {
        return;
    }

    const userGroup = await prisma.userGroup.findUnique({
        where: {
            userId_groupId: {
                userId: userId,
                groupId: groupId,
            },
        },
    });

    console.log(userGroup);

    if (!userGroup) {
        throw new Error("Unauthorized: User does not belong to this group");
    }

    return;
}

export async function assertUserIsAdminOrBelongsToTeam({
    teamId,
    user,
}: {
    user: User;
    teamId: string;
}) {
    if (user.userType === UserType.ADMIN) {
        return;
    }

    if (!user.teamId) {
        throw new Error("Unauthorized: User does not belong to a team");
    }

    if (user.teamId !== teamId) {
        throw new Error("Unauthorized: User does not belong to this team");
    }

    return;
}
