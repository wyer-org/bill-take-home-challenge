import { prisma } from "../db/client";
import { CreateTenantDto } from "../common/types/tenant-team";
import { UserType } from "@prisma/client";

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

    async getTenants() {
        return prisma.tenant.findMany();
    }
}
