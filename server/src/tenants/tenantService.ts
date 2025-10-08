import { prisma } from "../db/client";
import {
    AssignUserToTenantDto,
    CreateTenantDto,
    DeleteTenantDto,
    GetTenantsByCurrentUserDto,
    RemoveUserFromTenantDto,
} from "../common/types/tenant-team";
import { Tenant, UserType } from "@prisma/client";
import { assertAdmin, assertAdminAndTenant } from "../guards/assertions";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";

// todo add update and delete tenant
export class TenantService {
    async createTenant(data: CreateTenantDto) {
        const { name, createdBy } = data;

        // only admin can create a tenant, move to a guard later
        if (createdBy.userType !== UserType.ADMIN) {
            throw new Error("Only admin can create a tenant");
        }

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
        console.log(userId, tenantId, assignedBy);

        assertUserIsVerified({ user: assignedBy });

        assertAdminAndTenant({ tenantId, user: assignedBy });

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

    async removeUserFromTenant(data: RemoveUserFromTenantDto) {
        const { userId, tenantId, removedBy } = data;

        assertUserIsVerified({ user: removedBy });

        assertAdminAndTenant({ tenantId, user: removedBy });

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
            data: { tenantId: null },
        });

        return updatedUser;
    }

    async deleteTenant(data: DeleteTenantDto) {
        const { tenantId, deletedBy } = data;

        assertUserIsVerified({ user: deletedBy });

        assertAdmin(deletedBy);

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const deletedTenant = await prisma.tenant.delete({ where: { id: tenantId } });

        return deletedTenant;
    }

    async getTenants(data: GetTenantsByCurrentUserDto) {
        const { currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        assertAdminAndTenant({ tenantId: currentUser.tenantId!, user: currentUser });

        let tenants: Tenant[];

        if (currentUser.userType === UserType.ADMIN) {
            tenants = await prisma.tenant.findMany();
        } else {
            tenants = await prisma.tenant.findMany({ where: { id: currentUser.tenantId! } });
        }

        return tenants;
    }
}
