import { prisma } from "../db/client";
import { assertCanManageTeamGroups } from "../guards/assertions";
import { AssignRoleToGroupDto, RemoveRoleFromGroupDto } from "../common/types/roles";

export class RoleService {
    async createRole() {}
    async getRolesByGroup() {}
    async assignRoleToGroup(data: AssignRoleToGroupDto) {
        const { roleId, groupId, assignedBy } = data;

        // Check if group exists and get team info
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        // Check if user has permission to manage this group
        await assertCanManageTeamGroups(assignedBy, group.teamId);

        // Check if role exists
        const role = await prisma.role.findUnique({
            where: { id: roleId },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        // Check if role is already assigned to group
        const existingGroupRole = await prisma.groupRole.findUnique({
            where: {
                groupId_roleId: {
                    groupId,
                    roleId,
                },
            },
        });

        if (existingGroupRole) {
            throw new Error("Role is already assigned to this group");
        }

        // Assign role to group
        const groupRole = await prisma.groupRole.create({
            data: {
                groupId,
                roleId,
            },
            include: {
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return groupRole;
    }

    async removeRoleFromGroup(data: RemoveRoleFromGroupDto) {
        const { roleId, groupId, removedBy } = data;

        // Check if group exists and get team info
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        // Check if user has permission to manage this group
        await assertCanManageTeamGroups(removedBy, group.teamId);

        // Check if role is assigned to group
        const groupRole = await prisma.groupRole.findUnique({
            where: {
                groupId_roleId: {
                    groupId,
                    roleId,
                },
            },
        });

        if (!groupRole) {
            throw new Error("Role is not assigned to this group");
        }

        // Remove role from group
        await prisma.groupRole.delete({
            where: {
                groupId_roleId: {
                    groupId,
                    roleId,
                },
            },
        });

        return { success: true, message: "Role removed from group successfully" };
    }
}
