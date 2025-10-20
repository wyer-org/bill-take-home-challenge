// AuthGate.tsx
import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading, isError, user } = useAuth();
    const navigate = useNavigate();
    const routerState = useRouterState();
    const hasInitialized = useRef(false);

    const path = routerState.location.pathname;

    // public routes/paths
    const publicPaths = ["/auth/login/init", "/auth/register", "/auth/verify"];

    const isPublic = publicPaths.some((p) => path.startsWith(p));

    useEffect(() => {
        if (isLoading) return;

        hasInitialized.current = true;

        if (!isPublic && (isError || !isLoggedIn)) {
            navigate({ to: "/auth/login/init", replace: true });
            return;
        }

        // Example of redirecting logged in users based on user type
        if (isLoggedIn && path === "/") {
            if (user?.userType === "ADMIN") {
                navigate({ to: "/admin/dashboard", replace: true });
            } else {
                navigate({ to: "/user/dashboard", replace: true });
            }
        }
    }, [isLoggedIn, isLoading, isError, isPublic, navigate, path, user]);

    if (isLoading && !hasInitialized.current) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="text-gray-500 animate-pulse">Loading user...</span>
            </div>
        );
    }

    return <>{children}</>;
}
