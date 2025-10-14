import { prisma } from "../db/client";
import { assertCanManageTeamGroups, assertUserBelongsToGroupOrIsAdmin } from "../guards/assertions";
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
import { assertUserIsVerified } from "../guards/assertUserIsVerified";

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

        if (permissionsIds && permissionsIds.length > 0) {
            const existingPermissions = await prisma.permission.findMany({
                where: { id: { in: permissionsIds } },
            });

            if (existingPermissions.length !== permissionsIds.length) {
                throw new Error("Some permissions not found");
            }
        }

        try {
            const role = await prisma.role.create({
                data: {
                    name,
                    description,
                    groupId,
                    rolePermissions: {
                        create:
                            permissionsIds?.map((permissionId) => ({
                                permissionId,
                            })) || [],
                    },
                },
                include: {
                    rolePermissions: {
                        include: {
                            permission: true,
                        },
                    },
                    group: true,
                },
            });

            return { role };
        } catch (error: any) {
            // Handle unique constraint violation (now scoped to group)
            if (error.code === "P2002" && error.meta?.target?.includes("name")) {
                throw new Error(`Role with name "${name}" already exists in this group`);
            }
            // Re-throw other errors
            throw error;
        }
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

        // Check if role exists and get its current group
        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: { group: true },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        // Check if role is already assigned to this group
        if (role.groupId === groupId) {
            throw new Error("Role is already assigned to this group");
        }

        // Check if a role with the same name already exists in the target group
        const existingRoleInGroup = await prisma.role.findFirst({
            where: {
                name: role.name,
                groupId: groupId,
            },
        });

        if (existingRoleInGroup) {
            throw new Error(`A role with name "${role.name}" already exists in this group`);
        }

        try {
            // Update the role to assign it to the new group
            const updatedRole = await prisma.role.update({
                where: { id: roleId },
                data: { groupId },
                include: {
                    rolePermissions: {
                        include: {
                            permission: true,
                        },
                    },
                    group: true,
                },
            });

            return updatedRole;
        } catch (error: any) {
            // Handle unique constraint violation
            if (error.code === "P2002" && error.meta?.target?.includes("name")) {
                throw new Error(`Role with name "${role.name}" already exists in this group`);
            }
            // Re-throw other errors
            throw error;
        }
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

        // Check if role exists and is assigned to this group
        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: { group: true },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        if (role.groupId !== groupId) {
            throw new Error("Role is not assigned to this group");
        }

        // Remove role from group by setting groupId to null
        const updatedRole = await prisma.role.update({
            where: { id: roleId },
            data: { groupId: null },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
                group: true,
            },
        });

        return updatedRole;
    }

    async getRolesByGroup(data: GetRolesByGroupDto) {
        const { groupId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });
        assertUserBelongsToGroupOrIsAdmin({ userId: currentUser.id, groupId });

        const existingGroup = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!existingGroup) {
            throw new Error("Group not found");
        }

        const roles = await prisma.role.findMany({
            where: { groupId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
                group: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return roles;
    }

    async getRoleById({ roleId, currentUser }: { roleId: string; currentUser: User }) {
        assertUserIsVerified({ user: currentUser });

        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
                group: {
                    include: {
                        team: {
                            include: { users: true },
                        },
                    },
                },
            },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        if (currentUser.userType !== UserType.ADMIN) {
            if (!role.group) {
                throw new Error("Unauthorized: Role is not assigned to any group");
            }

            const hasAccess = role.group.team.users.some((user) => user.id === currentUser.id);
            if (!hasAccess) {
                throw new Error("Unauthorized: Cannot view this role");
            }
        }

        return role;
    }

    async updateRole(data: UpdateRoleDto) {
        const { roleId, name, description, updatedBy } = data;
        assertUserIsVerified({ user: updatedBy });

        const role = await prisma.role.findUnique({
            where: { id: roleId },
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
        });

        if (!role) {
            throw new Error("Role not found");
        }

        if (updatedBy.userType !== UserType.ADMIN) {
            if (!role.group) {
                throw new Error("Unauthorized: Role is not assigned to any group");
            }

            const hasAccess = role.group.team.users.some((user: any) => user.id === updatedBy.id);
            if (!hasAccess) {
                throw new Error("Unauthorized: Cannot update this role");
            }
        }

        if (name && name !== role.name && role.group) {
            const existingRole = await prisma.role.findFirst({
                where: {
                    name: name,
                    groupId: role.groupId,
                    id: { not: roleId },
                },
            });

            if (existingRole) {
                throw new Error(`Role name "${name}" already exists in this group`);
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

        assertUserIsVerified({ user: deletedBy });

        const role = await prisma.role.findUnique({
            where: { id: roleId },
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
        });

        if (!role) {
            throw new Error("Role not found");
        }

        if (deletedBy.userType !== UserType.ADMIN) {
            if (!role.group) {
                throw new Error("Unauthorized: Role is not assigned to any group");
            }

            const hasAccess = role.group.team.users.some((user: any) => user.id === deletedBy.id);
            if (!hasAccess) {
                throw new Error("Unauthorized: Cannot delete this role");
            }
        }

        await prisma.role.delete({
            where: { id: roleId },
        });

        return true;
    }

    async addPermissionsToRole(data: AddPermissionsToRoleDto) {
        const { roleId, permissionIds, addedBy } = data;
        assertUserIsVerified({ user: addedBy });

        const role = await prisma.role.findUnique({
            where: { id: roleId },
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
        });

        if (!role) {
            throw new Error("Role not found");
        }

        if (addedBy.userType !== UserType.ADMIN) {
            if (!role.group) {
                throw new Error("Unauthorized: Role is not assigned to any group");
            }

            const hasAccess = role.group.team.users.some((user: any) => user.id === addedBy.id);
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

        assertUserIsVerified({ user: removedBy });

        const role = await prisma.role.findUnique({
            where: { id: roleId },
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
        });

        if (!role) {
            throw new Error("Role not found");
        }

        // Check if user has permission to manage this role
        if (removedBy.userType !== UserType.ADMIN) {
            if (!role.group) {
                throw new Error("Unauthorized: Role is not assigned to any group");
            }

            const hasAccess = role.group.team.users.some((user: any) => user.id === removedBy.id);
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
