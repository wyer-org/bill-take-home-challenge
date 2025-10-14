import { prisma } from "../db/client";
import { assertAdminOrTeamMember, assertAdminOrTenant } from "../guards/assertions";
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

        assertAdminOrTeamMember({ teamId, user: createdBy });

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

        assertUserIsVerified({ user: updatedBy });

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        assertAdminOrTeamMember({ user: updatedBy, teamId: group.teamId });

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

        assertUserIsVerified({ user: currentUser });
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
            },
            orderBy: { createdAt: "desc" },
        });

        return groups;
    }

    async addUserToGroup(data: AddUserToGroupDto) {
        const { userId, groupId, addedBy } = data;

        assertUserIsVerified({ user: addedBy });

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        assertAdminOrTeamMember({ user: addedBy, teamId: group.team.id });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true },
        });

        if (!user) {
            throw new Error("User not found");
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

        assertUserIsVerified({ user: removedBy });

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        assertAdminOrTeamMember({ user: removedBy, teamId: group.team.id });

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

    async deleteGroup(data: DeleteGroupDto) {
        const { groupId, deletedBy } = data;

        assertUserIsVerified({ user: deletedBy });

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        assertAdminOrTeamMember({ user: deletedBy, teamId: group.team.id });

        await prisma.group.delete({
            where: { id: groupId },
        });

        return true;
    }

    async getGroupRoles(data: GetGroupRolesDto) {
        const { groupId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        assertAdminOrTeamMember({ user: currentUser, teamId: group.team.id });

        const groupRoles = await prisma.role.findMany({
            where: { groupId },
            orderBy: { createdAt: "desc" },
        });

        return { groupRoles, group };
    }

    // read group by id
    async getGroupById({ groupId, currentUser }: { groupId: string; currentUser: User }) {
        // Get group with members, roles, and permissions
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
