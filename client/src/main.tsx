// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { RouterProvider } from "@tanstack/react-router";
// import { router } from "./routes/index.ts";
// import "./index.css";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { AuthProvider } from "./context/AuthProvider.tsx";
// import { Toaster } from "sonner";
// import { useAuthContext } from "./hooks/useAuthContext.tsx";
// import AuthGate from "./context/AuthGate.tsx";

// const queryClient = new QueryClient();

// function AppRouter() {
//     const auth = useAuthContext();
//     return <RouterProvider router={router} context={{ auth }} />;
// }

// createRoot(document.getElementById("root")!).render(
//     <StrictMode>
//         <QueryClientProvider client={queryClient}>
//             <AuthProvider>
//                 <AuthGate>
//                     <Toaster position="top-center" duration={3000} />
//                     <AppRouter />
//                 </AuthGate>
//             </AuthProvider>
//         </QueryClientProvider>
//     </StrictMode>
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Toaster position="top-center" duration={3000} />
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
);
