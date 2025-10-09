import { prisma } from "../db/client";
import { assertCanManageTeamGroups } from "../guards/assertions";
import {
    AddPermissionsToRoleDto,
    AssignRoleToGroupDto,
    CreateRoleForGroupDto,
    DeleteRoleDto,
    GetRolesByGroupDto,
    RemovePermissionsFromRoleDto,
    RemoveRoleFromGroupDto,
    UpdateRoleDto,
} from "../common/types/roles";
import { UserType } from "@prisma/client";
import { User } from "@prisma/client";

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

    async getRoleById({ roleId, currentUser }: { roleId: string; currentUser: User }) {
        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
                groupRoles: {
                    include: {
                        group: {
                            include: {
                                team: {
                                    include: { users: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        // Check if user has access to view this role
        // User must be admin or have access to at least one group that has this role
        if (currentUser.userType !== UserType.ADMIN) {
            const hasAccess = role.groupRoles.some((groupRole) =>
                groupRole.group.team.users.some((user) => user.id === currentUser.id)
            );

            if (!hasAccess) {
                throw new Error("Unauthorized: Cannot view this role");
            }
        }

        return role;
    }

    async updateRole(data: UpdateRoleDto) {
        const { roleId, name, description, updatedBy } = data;

        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                groupRoles: {
                    include: {
                        group: {
                            include: {
                                team: {
                                    include: {
                                        users: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        // Check if user has permission to update this role
        // User must be admin or have access to manage groups that have this role
        if (updatedBy.userType !== UserType.ADMIN) {
            const hasAccess = role.groupRoles.some((groupRole) =>
                groupRole.group.team.users.some((user: any) => user.id === updatedBy.id)
            );

            if (!hasAccess) {
                throw new Error("Unauthorized: Cannot update this role");
            }
        }

        // Check if new name already exists in any group that has this role
        if (name && name !== role.name) {
            for (const groupRole of role.groupRoles) {
                const existingGroupRole = await prisma.groupRole.findFirst({
                    where: {
                        groupId: groupRole.groupId,
                        role: { name },
                        roleId: { not: roleId },
                    },
                });

                if (existingGroupRole) {
                    throw new Error(`Role name already exists in group: ${groupRole.group.name}`);
                }
            }
        }

        const updatedRole = await prisma.role.update({
            where: { id: roleId },
            data: {
                ...(name && { name }),
                ...(description && { description }),
            },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return updatedRole;
    }

    async deleteRole(data: DeleteRoleDto) {
        const { roleId, deletedBy } = data;

        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                groupRoles: {
                    include: {
                        group: {
                            include: {
                                team: {
                                    include: {
                                        users: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        // Check if user has permission to delete this role
        // User must be admin or have access to manage groups that have this role
        if (deletedBy.userType !== UserType.ADMIN) {
            const hasAccess = role.groupRoles.some((groupRole) =>
                groupRole.group.team.users.some((user: any) => user.id === deletedBy.id)
            );

            if (!hasAccess) {
                throw new Error("Unauthorized: Cannot delete this role");
            }
        }

        // Check if role is assigned to any groups
        if (role.groupRoles.length > 0) {
            const assignedGroups = role.groupRoles.map((gr) => gr.group.name).join(", ");
            throw new Error(
                `Cannot delete role. It is currently assigned to the following groups: ${assignedGroups}. Please remove the role from these groups first.`
            );
        }

        await prisma.role.delete({
            where: { id: roleId },
        });

        return true;
    }

    async addPermissionsToRole(data: AddPermissionsToRoleDto) {
        const { roleId, permissionIds, addedBy } = data;

        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                groupRoles: {
                    include: {
                        group: {
                            include: {
                                team: {
                                    include: {
                                        users: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        // Check if user has permission to manage this role
        if (addedBy.userType !== UserType.ADMIN) {
            const hasAccess = role.groupRoles.some((groupRole) =>
                groupRole.group.team.users.some((user: any) => user.id === addedBy.id)
            );

            if (!hasAccess) {
                throw new Error("Unauthorized: Cannot manage this role");
            }
        }

        // Validate that all permissions exist
        const permissions = await prisma.permission.findMany({
            where: { id: { in: permissionIds } },
        });

        if (permissions.length !== permissionIds.length) {
            throw new Error("One or more permissions not found");
        }

        // Check which permissions are already assigned
        const existingRolePermissions = await prisma.rolePermission.findMany({
            where: { roleId },
        });

        const existingPermissionIds = existingRolePermissions.map((rp) => rp.permissionId);
        const newPermissionIds = permissionIds.filter((id) => !existingPermissionIds.includes(id));

        if (newPermissionIds.length === 0) {
            throw new Error("All specified permissions are already assigned to this role");
        }

        // Add new permissions to role
        await prisma.rolePermission.createMany({
            data: newPermissionIds.map((permissionId) => ({
                roleId,
                permissionId,
            })),
        });

        return {
            success: true,
            message: `Added ${newPermissionIds.length} permissions to role`,
            addedPermissions: newPermissionIds,
        };
    }

    async removePermissionsFromRole(data: RemovePermissionsFromRoleDto) {
        const { roleId, permissionIds, removedBy } = data;

        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                groupRoles: {
                    include: {
                        group: {
                            include: {
                                team: {
                                    include: {
                                        users: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        // Check if user has permission to manage this role
        if (removedBy.userType !== UserType.ADMIN) {
            const hasAccess = role.groupRoles.some((groupRole) =>
                groupRole.group.team.users.some((user: any) => user.id === removedBy.id)
            );

            if (!hasAccess) {
                throw new Error("Unauthorized: Cannot manage this role");
            }
        }

        // Check which permissions are actually assigned to this role
        const existingRolePermissions = await prisma.rolePermission.findMany({
            where: {
                roleId,
                permissionId: { in: permissionIds },
            },
        });

        if (existingRolePermissions.length === 0) {
            throw new Error("None of the specified permissions are assigned to this role");
        }

        // Remove permissions from role
        await prisma.rolePermission.deleteMany({
            where: {
                roleId,
                permissionId: { in: permissionIds },
            },
        });

        return {
            success: true,
            message: `Removed ${existingRolePermissions.length} permissions from role`,
            removedPermissions: existingRolePermissions.map((rp) => rp.permissionId),
        };
    }
}
