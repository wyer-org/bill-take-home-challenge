import { api } from "../libs/api";
import { Permission } from "../types/permission.types";

export async function getPermissions() {
    const response = await api.get<Permission[]>("/permission");
    return response.data;
}
