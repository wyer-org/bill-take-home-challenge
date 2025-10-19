import { api } from "../libs/api";
import { User } from "../types/user.types";

export async function getUnverifiedUsers() {
    const response = await api.get<User[]>("/user/unverified");
    return response.data;
}

export async function getVerifiedUsers() {
    const response = await api.get<User[]>("/user/verified");
    return response.data;
}

export async function verifyUser({ email }: { email: string }) {
    const response = await api.post<{ message: string; success: boolean; user: User }>(
        "/user/verify",
        { email }
    );
    return response.data;
}
