import { api } from "../libs/api";

export async function getUserTenantTeams({ tenantId }: { tenantId: string }) {
    const response = await api.get(`/team/${tenantId}`);
    return response.data;
}
