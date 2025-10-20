import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import FormInput from "../../../components/FormInput";
import { useCustomForm } from "../../../hooks/useCustomForm";

function UserTeams() {
    const { user } = useAuth();
    const [showCreate, setShowCreate] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<{ name: string }>({ name: "" });

    function handletoggleShowCreate() {
        setShowCreate((prev) => !prev);
    }

    function handleCreateTeam() {}

    useEffect(() => {
        console.log(user);
    }, [user]);

    return (
        <div className="flex flex-col items-center w-[95%] md:w-[400px] mx-auto gap-4 ">
            <h1 className="text-xl font-bold border-b border-gray-400">User team(s)</h1>
            {!user?.tenantId ? (
                <div>User needs to belong to a tenant to create a team</div>
            ) : (
                <div className="w-full p-2 flex justify-center">
                    <Button text="Create tenant" onClick={handletoggleShowCreate} />
                </div>
            )}

            {showCreate && (
                <div className="border border-gray-300 w-full p-2 rounded-md">
                    <form
                        onSubmit={handleSubmit(handleCreateTeam)}
                        className="mt-4 flex flex-col gap-3"
                    >
                        <div>
                            <label htmlFor="name">Team name</label>
                            <FormInput
                                {...register("name", {
                                    required: "Name is a reequired field",
                                    minLength: {
                                        message: "Name must be at least 3 characters",
                                        value: 3,
                                    },
                                })}
                            />
                            <ErrorMessage error={errors.name} />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" text="Create" className="text-green-900" />
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default UserTeams;
