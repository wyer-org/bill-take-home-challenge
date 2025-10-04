import axios from "axios";

export const baseURL = import.meta.env.VITE_BASE_API_URL;

export const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});
