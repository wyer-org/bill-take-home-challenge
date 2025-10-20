import React from "react";
import { useAuth, useLogoutUser } from "../hooks/useAuth";
import Button from "../components/Button";

function MainLayout({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    const { mutateAsync: logoutUser } = useLogoutUser();

    return (
        <div className="min-h-screen flex flex-col items-center justify-between bg-gray-50">
            <div className="flex w-full border-b border-b-blue-100 shadow-md p-2 pr-4 justify-end mb-2 min-h-14">
                {isLoggedIn && (
                    <Button
                        text="Logout"
                        className="border-red-500 text-red-500"
                        onClick={() => logoutUser()}
                    />
                )}
            </div>
            <main className="flex-grow flex w-full">{children}</main>
            <footer className="flex w-full">Footer</footer>
        </div>
    );
}

export default MainLayout;
