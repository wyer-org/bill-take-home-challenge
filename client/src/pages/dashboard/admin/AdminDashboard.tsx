import { Outlet, useNavigate } from "@tanstack/react-router";
import { adminTabs } from "../../../store/admin-store";
import MainLayout from "../../../layouts/MainLayout";
import Button from "../../../components/Button";

function AdminDashboard() {
    const navigate = useNavigate();

    function handleTabClicked(path: string) {
        navigate({ to: path });
    }
    return (
        <MainLayout>
            <div className="w-full flex flex-col gap-3 mt-3">
                <div className="flex justify-center gap-2">
                    {adminTabs.map((tab, index) => (
                        <Button
                            key={index}
                            className=""
                            onClick={() => handleTabClicked(tab.path)}
                            text={tab.title}
                        />
                    ))}
                </div>
                <Outlet />
            </div>
        </MainLayout>
    );
}

export default AdminDashboard;
