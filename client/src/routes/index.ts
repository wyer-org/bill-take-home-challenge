import { createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import Root from "../pages/Root";
import About from "../pages/About";

const rootRoute = createRootRoute({
    component: Root,
    
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/"
})

const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: About,
    path: "/about",
});


export const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute,aboutRoute]),
});
