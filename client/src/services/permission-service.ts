import { api } from "../libs/api";

export async function getPermissions() {
    const response = await api.get("/permissions");
    return response.data;
}
