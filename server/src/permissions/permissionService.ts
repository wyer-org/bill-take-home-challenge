import { Action, Module } from "@prisma/client";
import { CreatePermissionDto, SeedAdminPermissionsDto } from "../common/types/permission";
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
}
