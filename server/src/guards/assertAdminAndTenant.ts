import { User, UserType } from "@prisma/client";

export function assertAdminAndTenant({ tenantId, user }: { user: User; tenantId: string }) {
    if (user.userType === UserType.ADMIN) {
        return;
    }

    if (user.userType === UserType.USER && user.tenantId === tenantId) {
        return;
    }

    throw new Error("Unauthorized: Must be admin or belong to the same tenant");
}

export function assertAdmin(user: User) {
    if (user.userType === UserType.ADMIN) {
        return;
    }
    throw new Error("Unauthorized: Must be admin");
}
