import { createRouter, createRoute, createRootRoute, redirect } from "@tanstack/react-router";
import Root from "../pages/Root";
import About from "../pages/About";
import RegisterUser from "../pages/auth/RegisterUser";
import InitLoginUser from "../pages/auth/InitLoginUser";
import VerifyMagicLink from "../pages/auth/VerifyMagicLink";
import { AuthContextStateActions } from "../context/AuthProvider";
import AdminDashboard from "../pages/dashboard/admin/AdminDashboard";
import AdminVerifyUsers from "../pages/dashboard/admin/AdminUnverifiedUsers";
import AdminPermissions from "../pages/dashboard/admin/AdminPermissions";
import AdminTenant from "../pages/dashboard/admin/AdminTenant";
import AdminVerifiedUsers from "../pages/dashboard/admin/AdminVerifiedUsers";
import UserDashboard from "../pages/dashboard/user/UserDashboard";
import UserTeams from "../pages/dashboard/user/UserTeams";
import { UserType } from "../types/user.types";

type Context = {
    auth: AuthContextStateActions;
};

const rootRoute = createRootRoute({
    component: Root,
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
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
    beforeLoad: async ({ context }) => {
        const { auth } = context as Context;

        if (!auth.isLoggedIn) {
            throw redirect({ to: "/auth/login/init" });
        }

        if (auth.user?.userType !== UserType.ADMIN) {
            throw redirect({ to: "/user/dashboard" });
        }
    },
});

const adminDashboardIndexRoute = createRoute({
    getParentRoute: () => rootAdminDashboard,
    path: "/",
    beforeLoad: async () => {
        throw redirect({ to: "/admin/dashboard/users/unverified" });
    },
});

const adminUnverifiedUsersRoute = createRoute({
    getParentRoute: () => rootAdminDashboard,
    path: "users/unverified",
    component: AdminVerifyUsers,
});

const adminUsersRoute = createRoute({
    getParentRoute: () => rootAdminDashboard,
    path: "users/verified",
    component: AdminVerifiedUsers,
});

const adminPermissionsRoute = createRoute({
    getParentRoute: () => rootAdminDashboard,
    path: "permissions",
    component: AdminPermissions,
});

const adminTenantsRoute = createRoute({
    getParentRoute: () => rootAdminDashboard,
    path: "tenants",
    component: AdminTenant,
});

const rootUserDashboard = createRoute({
    getParentRoute: () => rootRoute,
    path: "user/dashboard",
    component: UserDashboard,
    beforeLoad: async ({ context }) => {
        const { auth } = context as Context;

        if (!auth.isLoggedIn) {
            throw redirect({ to: "/auth/login/init" });
        }

        if (auth.user?.userType !== UserType.USER) {
            throw redirect({ to: "/admin/dashboard" });
        }
    },
});

const userDashboardIndexRoute = createRoute({
    getParentRoute: () => rootUserDashboard,
    path: "/",
    beforeLoad: async () => {
        throw redirect({ to: "/user/dashboard/teams" });
    },
});

const userTeamsRoute = createRoute({
    getParentRoute: () => rootUserDashboard,
    path: "teams",
    component: UserTeams,
});

export const router = createRouter({
    routeTree: rootRoute.addChildren([
        indexRoute,
        aboutRoute,
        registerUserRoute,
        initLoginUserRoute,
        verifyMagicLinkRoute,
        rootAdminDashboard,
        adminDashboardIndexRoute,
        adminUsersRoute,
        adminUnverifiedUsersRoute,
        adminPermissionsRoute,
        adminTenantsRoute,
        rootUserDashboard,
        userDashboardIndexRoute,
        userTeamsRoute,
    ]),
    context: {} as Context,
});
