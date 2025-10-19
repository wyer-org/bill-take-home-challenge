import { api } from "../libs/api";

export async function getUserProfile() {
    const response = await api.get("/user/profile");
    return response.data;
}
