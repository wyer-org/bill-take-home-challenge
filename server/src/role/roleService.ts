import { prisma } from "../db/client";
import { assertCanManageTeamGroups } from "../guards/assertions";
import {
    AssignRoleToGroupDto,
    CreateRoleForGroupDto,
    GetRolesByGroupDto,
    RemoveRoleFromGroupDto,
} from "../common/types/roles";

export class RoleService {
    async createRoleForGroup(data: CreateRoleForGroupDto) {
        const { name, description, permissionsIds, createdBy, groupId } = data;
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        await assertCanManageTeamGroups(createdBy, group.teamId);

        const existingGroupRole = await prisma.groupRole.findFirst({
            where: {
                groupId,
                role: { name },
            },
        });

        if (existingGroupRole) {
            throw new Error("Role/Role name already exists for this group");
        }

        if (permissionsIds && permissionsIds.length > 0) {
            const existingPermissions = await prisma.permission.findMany({
                where: { id: { in: permissionsIds } },
            });

            if (existingPermissions.length !== permissionsIds.length) {
                throw new Error("Some permissions not found");
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            // create role and assign permissions
            const role = await tx.role.create({
                data: {
                    name,
                    description,
                    rolePermissions: {
                        create:
                            permissionsIds?.map((permissionId) => ({
                                permissionId,
                            })) || [],
                    },
                },
                include: {
                    rolePermissions: true,
                },
            });

            // assign role to group
            const groupRole = await tx.groupRole.create({
                data: {
                    groupId,
                    roleId: role.id,
                },
            });

            return {
                role,
                groupRole,
            };
        });

        return result;
    }

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
                role: true,
                group: true,
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

        return true;
    }

    async getRolesByGroup(data: GetRolesByGroupDto) {
        const { groupId, currentUser } = data;
        await assertCanManageTeamGroups(currentUser, currentUser.teamId ?? "");

        const existingGroup = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!existingGroup) {
            throw new Error("Group not found");
        }

        const roles = await prisma.groupRole.findMany({
            where: { groupId },
            include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
            orderBy: { createdAt: "desc" },
        });

        return roles;
    }
}
