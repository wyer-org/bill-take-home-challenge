// src/context/AuthProvider.tsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return ctx;
}
