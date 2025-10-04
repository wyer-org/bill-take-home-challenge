import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export default function Root() {
    return (
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    );
}
