import { useGetUnverifiedUsers, useVerifyUser } from "../../../hooks/useUser";
import Button from "../../../components/Button";
import { useEffect, useState } from "react";
import { User } from "../../../types/user.types";
import { notify } from "../../../components/Toast";

function AdminUnverifiedUsers() {
    const { data: usersFetched, isLoading: isFetchingUnverifiedUsers } = useGetUnverifiedUsers();
    const { mutateAsync: verifyUser } = useVerifyUser();
    const [users, setUsers] = useState<User[]>([]);

    async function handleVerifyUser(email: string) {
        const response = await verifyUser({ email });

        if (!response.success) {
            notify({ title: "Unsuccessfull", description: response.message });
            return;
        }

        notify({ title: "Success!", description: response.message });
    }

    useEffect(() => {
        if (usersFetched) {
            setUsers(usersFetched);
        }
    }, [users, usersFetched]);

    return (
        <div className="flex flex-col items-center w-[95%] md:w-[420px] mx-auto gap-4 ">
            <h1 className="text-xl font-bold border-b border-gray-400">Unverified Users</h1>

            {isFetchingUnverifiedUsers && <span>loading...</span>}
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
                            text="Verify"
                            className="p-1! px-2!"
                            onClick={() => handleVerifyUser(user.email)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminUnverifiedUsers;
