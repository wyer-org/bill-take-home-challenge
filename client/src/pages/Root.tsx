import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AuthGate from "../context/AuthGate";

export default function Root() {
    return (
        <>
            <AuthGate>
                <Outlet />
            </AuthGate>
            <TanStackRouterDevtools />
        </>
    );
}
