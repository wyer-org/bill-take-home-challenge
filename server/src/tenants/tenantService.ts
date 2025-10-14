import { prisma } from "../db/client";
import {
    AssignUserToTenantDto,
    CreateTenantDto,
    DeleteTenantDto,
    GetTenantsByCurrentUserDto,
    GetTenantUsersDto,
    RemoveUserFromTenantDto,
} from "../common/types/tenant-team";
import { Tenant, User, UserType } from "@prisma/client";
import { assertAdminOrTenant, assertUserIsAdmin } from "../guards/assertions";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";

// todo add update and delete tenant
export class TenantService {
    async createTenant(data: CreateTenantDto) {
        const { name, createdBy } = data;

        assertUserIsAdmin({ user: createdBy });

        const existingTenant = await prisma.tenant.findUnique({
            where: {
                name,
            },
        });

        if (existingTenant) {
            throw new Error("Tenant with this name already exists");
        }

        const tenant = await prisma.tenant.create({
            data: { name },
        });

        return tenant;
    }

    async assignUserToTenant(data: AssignUserToTenantDto) {
        const { userId, tenantId, assignedBy } = data;

        assertUserIsVerified({ user: assignedBy });

        assertUserIsAdmin({ user: assignedBy });

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const userToAssign = await prisma.user.findUnique({ where: { id: userId } });
        if (!userToAssign) {
            throw new Error("User not found");
        }

        const updatedUser = await prisma.user.update({ where: { id: userId }, data: { tenantId } });

        return updatedUser;
    }

    async getTenantUsers(data: GetTenantUsersDto) {
        const { tenantId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        assertAdminOrTenant({ tenantId, user: currentUser });

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const users = await prisma.user.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
        });

        return { tenant, users };
    }

    async removeUserFromTenant(data: RemoveUserFromTenantDto) {
        const { userId, tenantId, removedBy } = data;

        assertUserIsVerified({ user: removedBy });

        assertAdminOrTenant({ tenantId, user: removedBy });

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const userToRemove = await prisma.user.findUnique({ where: { id: userId } });

        if (!userToRemove || userToRemove.tenantId !== tenantId) {
            throw new Error("User not found or not in tenant");
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { tenantId: null, teamId: null },
        });

        return updatedUser;
    }

    async deleteTenant(data: DeleteTenantDto) {
        const { tenantId, deletedBy } = data;

        assertUserIsVerified({ user: deletedBy });

        assertUserIsAdmin({ user: deletedBy });

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const deletedTenant = await prisma.tenant.delete({ where: { id: tenantId } });

        return deletedTenant;
    }

    async getTenants(data: GetTenantsByCurrentUserDto) {
        const { currentUser } = data;
        assertUserIsAdmin({ user: currentUser });

        assertUserIsVerified({ user: currentUser });

        assertAdminOrTenant({ tenantId: currentUser.tenantId!, user: currentUser });

        let tenants: Tenant[];

        if (currentUser.userType === UserType.ADMIN) {
            tenants = await prisma.tenant.findMany();
        } else {
            tenants = await prisma.tenant.findMany({ where: { id: currentUser.tenantId! } });
        }

        return tenants;
    }

    async getTenantById(tenantId: string, currentUser: User) {
        assertUserIsVerified({ user: currentUser });

        assertAdminOrTenant({ tenantId, user: currentUser });

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                users: true,
                teams: true,
            },
        });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    }

    async updateTenant(data: { tenantId: string; name?: string; updatedBy: User }) {
        const { tenantId, name, updatedBy } = data;

        assertUserIsVerified({ user: updatedBy });

        assertUserIsAdmin({ user: updatedBy });

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        if (name && name !== tenant.name) {
            const existingTenant = await prisma.tenant.findFirst({
                where: {
                    name,
                    id: { not: tenantId },
                },
            });

            if (existingTenant) {
                throw new Error("Tenant name already exists");
            }
        }

        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                ...(name && { name }),
            },
        });

        return updatedTenant;
    }
}
