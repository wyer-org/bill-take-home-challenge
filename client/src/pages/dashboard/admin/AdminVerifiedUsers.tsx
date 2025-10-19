import { useEffect, useState } from "react";
import { User } from "../../../types/user.types";
import { addUserForTenantAssignToLocal, useGetVerifiedUsers } from "../../../hooks/useUser";
import Button from "../../../components/Button";
import { notify } from "../../../components/Toast";
import { useNavigate } from "@tanstack/react-router";

function AdminVerifiedUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const { data: usersFetched, isLoading: isFetchingVerifiedUsers } = useGetVerifiedUsers();
    const navigate = useNavigate();

    function handleAssignUserToTenant({ user }: { user: User }) {
        addUserForTenantAssignToLocal({ user });
        notify({ title: "Pending", description: "Assign user to tenant pending" });
        navigate({ to: "/admin/dashboard/tenants" });
    }

    useEffect(() => {
        if (usersFetched) {
            setUsers(usersFetched);
        }
    }, [users, usersFetched]);

    return (
        <div className="flex flex-col items-center w-[95%] md:w-[420px] mx-auto gap-4 ">
            <h1 className="text-xl font-bold border-b border-gray-400">Verified Users</h1>

            {isFetchingVerifiedUsers && <span>loading...</span>}
            {users?.length === 0 && <div>No users found </div>}

            <ul className="w-full flex flex-col p-2">
                {users?.map((user) => (
                    <li
                        key={user.id}
                        className="flex justify-between border-b border-gray-200 p-2 hover:bg-blue-100 cursor-pointer rounded-md"
                    >
                        <span>
                            {user.name} : {user.email}
                        </span>
                        <Button
                            text="Tenant Assign"
                            className="p-1! px-2!"
                            onClick={() => handleAssignUserToTenant({ user })}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminVerifiedUsers;
