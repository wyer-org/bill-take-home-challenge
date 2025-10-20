import { useEffect, useState } from "react";
import { useGetPermissions } from "../../../hooks/usePermissions";
import { Permission } from "../../../types/permission.types";

function AdminPermissions() {
    const { data: fetchedPermissions, isLoading } = useGetPermissions();
    const [permissions, setPermissions] = useState<Permission[]>([]);

    useEffect(() => {
        if (fetchedPermissions) {
            setPermissions(fetchedPermissions);
        }
    }, [fetchedPermissions]);

    return (
        <div className="flex flex-col items-center w-[95%] md:w-[420px] mx-auto gap-4 ">
            <h1 className="text-xl font-bold border-b border-gray-400">Permissions</h1>

            {isLoading && <span>loading...</span>}
            {permissions?.length === 0 && <div>No permissions found </div>}

            <ul className="w-full flex flex-col p-2">
                <div className="flex justify-between mb-4 border-b border-blue-300 pb-1 text-blue-500 font-semibold">
                    <span>Name</span>
                    <span>Description</span>
                </div>
                {permissions?.map((permission) => (
                    <li
                        key={permission.id}
                        className="flex justify-between border-b border-gray-200 p-2 hover:bg-blue-100 cursor-pointer rounded-md"
                    >
                        <span>{permission.name}</span>
                        <span>{permission.description}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminPermissions;
