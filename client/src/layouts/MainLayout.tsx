import React from "react";

function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-between bg-gray-50">
            <div className="flex w-full">top nav</div>
            <main className="flex-grow flex w-full">{children}</main>
            <footer className="flex w-full">Footer</footer>
        </div>
    );
}

export default MainLayout;
