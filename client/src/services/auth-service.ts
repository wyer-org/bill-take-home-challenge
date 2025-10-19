import { api } from "../libs/api";
import type { RegisterUserDto } from "../types/user.types";

export async function registerUser(data: RegisterUserDto) {
    const response = await api.post("/auth/register", data);
    return response.data;
}

export async function initUserLogin({ email }: { email: string }) {
    const response = await api.post("/auth/login/init", { email });
    return response.data;
}

export async function verifyMagicLink(token: string) {
    const response = await api.post(`/auth/login?token=${token}`);
    return response.data;
}

export async function logoutUser() {
    const response = await api.post("/auth/logout");
    return response.data;
}
