import { api } from "../libs/api";

export async function getTests() {
    try {
        const { data } = await api.get("/test");
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
