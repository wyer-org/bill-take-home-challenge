import { Outlet, useNavigate } from "@tanstack/react-router";
import Button from "../../../components/Button";
import MainLayout from "../../../layouts/MainLayout";
import { userTabs } from "../../../store/tabs-store";

function UserDashboard() {
    const navigate = useNavigate();

    function handleTabClicked(path: string) {
        navigate({ to: path });
    }
    return (
        <MainLayout>
            <div className="w-full flex flex-col gap-3 mt-3">
                <div className="flex justify-center gap-2">
                    {userTabs.map((tab, index) => (
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

export default UserDashboard;
