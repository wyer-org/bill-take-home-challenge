import { prisma } from "../db/client";
import { assertAdminOrTeamMember } from "../guards/assertions";
import {
    CreateGroupDto,
    UpdateGroupDto,
    GetGroupsByTeamDto,
    AddUserToGroupDto,
    RemoveUserFromGroupDto,
    GetGroupMembersDto,
    DeleteGroupDto,
    GroupWithMembers,
    GetGroupRolesDto,
} from "../common/types/group";
import { Team, User } from "@prisma/client";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";

export class GroupService {
    // todo: use transactions to ensure data consistency
    async createGroup(data: CreateGroupDto) {
        const { name, teamId, createdBy } = data;

        assertUserIsVerified({ user: createdBy });
        await this.assertCanManageTeamGroups(createdBy, teamId);

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { tenant: true },
        });

        if (!team) {
            throw new Error("Team not found");
        }

        const existingGroup = await prisma.group.findFirst({
            where: { teamId, name },
        });

        if (existingGroup) {
            throw new Error("Group name already exists in this team");
        }

        const group = await prisma.group.create({
            data: {
                name,
                teamId,
            },
        });

        await prisma.userGroup.create({
            data: {
                userId: createdBy.id,
                groupId: group.id,
            },
        });

        const groupWithDetails = await prisma.group.findUnique({
            where: { id: group.id },
            include: {
                team: true,
                userGroups: true,
                groupRoles: true,
            },
        });

        return groupWithDetails;
    }

    async updateGroup(data: UpdateGroupDto) {
        const { groupId, name, updatedBy } = data;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        await this.assertCanManageTeamGroups(updatedBy, group.teamId);

        if (name && name !== group.name) {
            const existingGroup = await prisma.group.findFirst({
                where: {
                    teamId: group.teamId,
                    name,
                    id: { not: groupId },
                },
            });

            if (existingGroup) {
                throw new Error("Group name already exists in this team");
            }
        }

        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: {
                name,
            },
        });

        return updatedGroup;
    }

    async getGroupsByTeam(data: GetGroupsByTeamDto): Promise<GroupWithMembers[]> {
        const { teamId, currentUser } = data;

        assertAdminOrTeamMember({ user: currentUser, teamId });

        const groups = await prisma.group.findMany({
            where: { teamId },
            include: {
                userGroups: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                groupRoles: {
                    include: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return groups;
    }

    async addUserToGroup(data: AddUserToGroupDto) {
        const { userId, groupId, addedBy } = data;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        await this.assertCanManageTeamGroups(addedBy, group.teamId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (user.tenantId !== group.team.tenantId) {
            throw new Error("User does not belong to the same tenant/organisation as the team");
        }

        const existingUserGroup = await prisma.userGroup.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
        });

        if (existingUserGroup) {
            throw new Error("User is already a member of this group");
        }

        const userGroup = await prisma.userGroup.create({
            data: {
                userId,
                groupId,
            },
            include: {
                user: true,
                group: true,
            },
        });

        return userGroup;
    }

    async removeUserFromGroup(data: RemoveUserFromGroupDto) {
        const { userId, groupId, removedBy } = data;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        await this.assertCanManageTeamGroups(removedBy, group.teamId);

        const userGroup = await prisma.userGroup.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
        });

        if (!userGroup) {
            throw new Error("User is not a member of this group");
        }

        await prisma.userGroup.delete({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
        });
    }

    async getGroupMembers(data: GetGroupMembersDto) {
        const { groupId, currentUser } = data;

        // Check if group exists and get team info
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        // Check if user has access to view team members
        assertAdminOrTeamMember({ user: currentUser, teamId: group.teamId });

        const groupMembers = await prisma.userGroup.findMany({
            where: { groupId },
            include: {
                user: true,
            },
            orderBy: { user: { createdAt: "desc" } },
        });

        const members = await prisma.user.findMany({
            where: { userGroups: { some: { groupId } } },
            orderBy: { createdAt: "desc" },
        });

        return { group, members };
    }

    async deleteGroup(data: DeleteGroupDto) {
        const { groupId, deletedBy } = data;

        // Check if group exists and get team info
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        // Check if user has permission to delete this group
        await this.assertCanManageTeamGroups(deletedBy, group.teamId);

        // Delete the group (cascade will handle related records)
        await prisma.group.delete({
            where: { id: groupId },
        });

        return { success: true, message: "Group deleted successfully" };
    }
    async getGroupRoles(data: GetGroupRolesDto) {
        const { groupId, currentUser } = data;

        // Check if group exists and get team info
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        // Check if user has access to view team roles
        assertAdminOrTeamMember({ user: currentUser, teamId: group.teamId });

        const roles = await prisma.groupRole.findMany({
            where: { groupId },
            include: {
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return roles;
    }

    async getUserGroups(currentUser: User) {
        assertUserIsVerified({ user: currentUser });
        console.log("currentUser", currentUser);

        const groups = await prisma.userGroup
            .findMany({
                where: { userId: currentUser.id },
                select: {
                    group: true,
                },
                orderBy: { group: { createdAt: "desc" } },
            })
            .then((userGroups) => userGroups.map((userGroup) => userGroup.group));

        return groups;
    }

    private async assertCanManageTeamGroups(user: User, teamId: string) {
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
}
