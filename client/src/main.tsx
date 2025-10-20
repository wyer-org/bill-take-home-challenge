import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import { Toaster } from "sonner";
import { useAuthContext } from "./hooks/useAuthContext";

const queryClient = new QueryClient();

function AppRouter() {
    const auth = useAuthContext();

    if (auth.isLoading) {
        return <div>loading user...</div>;
    }

    return <RouterProvider router={router} context={{ auth }} />;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Toaster position="top-center" duration={3000} />
                <AppRouter />
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
);
