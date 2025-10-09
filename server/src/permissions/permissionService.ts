import { Action, Module, User, UserType } from "@prisma/client";
import {
    CreatePermissionDto,
    SeedAdminPermissionsDto,
    UpdatePermissionDto,
} from "../common/types/permission";
import { prisma } from "../db/client";
import { assertAdmin } from "../guards/assertions";

export class PermissionService {
    async createPermission(data: CreatePermissionDto) {
        const { module, action, createdBy, name, description } = data;
        assertAdmin(createdBy);

        const existingPermission = await prisma.permission.findFirst({
            where: { module, action },
        });

        if (existingPermission) {
            throw new Error("Permission already exists for this module and action");
        }

        const permission = await prisma.permission.create({
            data: { module, action, name, description },
        });

        return permission;
    }

    async getPermissions() {
        const permissions = await prisma.permission.findMany({
            orderBy: [{ module: "asc" }, { action: "asc" }],
        });

        return permissions;
    }

    async seedAdminPermissions(data: SeedAdminPermissionsDto) {
        const { createdBy } = data;
        assertAdmin(createdBy);

        const modules = Object.values(Module);
        const actions = Object.values(Action);
        const permissions = [];

        for (const module of modules) {
            for (const action of actions) {
                try {
                    const permission = await this.createPermission({
                        module,
                        action,
                        name: `${module}:${action}`,
                        description: `${module}:${action}`,
                        createdBy,
                    });

                    permissions.push(permission);
                } catch (error) {
                    console.error(
                        `Failed to seed permission for module: ${module}, action: ${action}`,
                        error
                    );
                }
            }
        }

        return permissions;
    }

    async getPermissionById(permissionId: string, currentUser: User) {
        if (currentUser.userType !== UserType.ADMIN) {
            throw new Error("Unauthorized: Only admins can view individual permissions");
        }

        const permission = await prisma.permission.findUnique({
            where: { id: permissionId },
            include: {
                rolePermissions: {
                    include: {
                        role: {
                            include: {
                                groupRoles: true,
                            },
                        },
                    },
                },
            },
        });

        if (!permission) {
            throw new Error("Permission not found");
        }

        return permission;
    }

    async updatePermission(data: UpdatePermissionDto) {
        const { permissionId, name, description, updatedBy } = data;

        if (updatedBy.userType !== UserType.ADMIN) {
            throw new Error("Unauthorized: Only admins can update permissions");
        }

        const permission = await prisma.permission.findUnique({
            where: { id: permissionId },
        });

        if (!permission) {
            throw new Error("Permission not found");
        }

        const updatedPermission = await prisma.permission.update({
            where: { id: permissionId },
            data: {
                ...(name && { name }),
                ...(description && { description }),
            },
        });

        return updatedPermission;
    }

    async deletePermission(permissionId: string, deletedBy: User) {
        if (deletedBy.userType !== UserType.ADMIN) {
            throw new Error("Unauthorized: Only admins can delete permissions");
        }

        const permission = await prisma.permission.findUnique({
            where: { id: permissionId },
            include: {
                rolePermissions: {
                    include: {
                        role: {
                            include: {
                                groupRoles: true,
                            },
                        },
                    },
                },
            },
        });

        if (!permission) {
            throw new Error("Permission not found");
        }

        if (permission.rolePermissions.length > 0) {
            const usedInRoles = permission.rolePermissions.map((rp) => rp.role.name).join(", ");
            throw new Error(
                `Cannot delete permission. It is currently used in the following roles: ${usedInRoles}. Please remove the permission from these roles first.`
            );
        }

        await prisma.permission.delete({
            where: { id: permissionId },
        });

        return true;
    }
}
