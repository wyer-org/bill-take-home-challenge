import { createRouter, createRoute, createRootRoute, redirect } from "@tanstack/react-router";
import Root from "../pages/Root";
import About from "../pages/About";
import RegisterUser from "../pages/auth/RegisterUser";
import InitLoginUser from "../pages/auth/InitLoginUser";
import VerifyMagicLink from "../pages/auth/VerifyMagicLink";
import { AuthContextStateActions } from "../context/AuthProvider";
import { UserType } from "../types/user.types";
import AdminDashboard from "../pages/dashboard/admin/AdminDashboard";
import AdminVerifyUsers from "../pages/dashboard/admin/AdminVerifyUsers";
import AdminPermissions from "../pages/dashboard/admin/AdminPermissions";

type Context = {
    auth: AuthContextStateActions;
};

const rootRoute = createRootRoute({
    component: Root,
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    beforeLoad: async ({ context }) => {
        const { auth } = context as Context;

        const { isLoggedIn, isLoading, user } = auth;

        if (isLoading) return;

        if (!isLoggedIn) throw redirect({ to: "/auth/login/init" });

        if (user?.userType === UserType.ADMIN) throw redirect({ to: "/admin/dashboard" });

        throw redirect({ to: "/user/dashboard" });
    },
});

const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: About,
    path: "about",
});

const registerUserRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: RegisterUser,
    path: "auth/register",
});

const initLoginUserRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: InitLoginUser,
    path: "auth/login/init",
});

const verifyMagicLinkRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: VerifyMagicLink,
    path: "auth/verify",
});

const rootAdminDashboard = createRoute({
    getParentRoute: () => rootRoute,
    path: "admin/dashboard",
    component: AdminDashboard,
});

const adminUsersRoute = createRoute({
    getParentRoute: () => rootAdminDashboard,
    path: "users",
    component: AdminVerifyUsers,
});

const adminPermissionsRoute = createRoute({
    getParentRoute: () => rootAdminDashboard,
    path: "permissions",
    component: AdminPermissions,
});

export const router = createRouter({
    routeTree: rootRoute.addChildren([
        indexRoute,
        aboutRoute,
        registerUserRoute,
        initLoginUserRoute,
        verifyMagicLinkRoute,
        rootAdminDashboard,
        adminUsersRoute,
        adminPermissionsRoute,
    ]),
    context: {} as Context,
});
