import { api } from "../libs/api";
import { Tenant } from "../types/tenant.types";
import { User } from "../types/user.types";

export async function getTenants() {
    const response = await api.get<{ success: boolean; tenants: Tenant[]; message: string }>(
        "/tenant"
    );
    return response.data;
}

export async function createTenant({ name }: { name: string }) {
    const response = await api.post<{ success: boolean; tenant: Tenant | null; message: string }>(
        "/tenant",
        { name }
    );
    return response.data;
}

export async function deleteTenant({ tenantId }: { tenantId: string }) {
    const response = await api.delete<{ success: boolean; tenant: Tenant | null; message: string }>(
        `/tenant/${tenantId}/delete`
    );
    return response.data;
}

export async function assignUserToTenant({
    tenantId,
    userId,
}: {
    tenantId: string;
    userId: string;
}) {
    const response = await api.post<{
        success: boolean;
        tenant: Tenant | null;
        user: User | null;
        message: string;
    }>(`/tenant/${tenantId}/${userId}/assign`);
    return response.data;
}
