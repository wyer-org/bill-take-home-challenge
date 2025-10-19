import { useEffect, useState } from "react";
import {
    useAssignUserToTenant,
    useCreateTenant,
    useDeleteenant,
    useGetTenants,
} from "../../../hooks/useTenant";
import { Tenant } from "../../../types/tenant.types";
import { notify } from "../../../components/Toast";
import Button from "../../../components/Button";
import FormInput from "../../../components/FormInput";
import { useCustomForm } from "../../../hooks/useCustomForm";
import ErrorMessage from "../../../components/ErrorMessage";
import {
    getUserForTenantAssignFromLocal,
    removeUserForTenantAssignInLocal,
} from "../../../hooks/useUser";
import { User } from "../../../types/user.types";

function AdminTenant() {
    const { data: fetchedTenantsResponse, isLoading } = useGetTenants();
    const { isPending: createTenantPending, mutateAsync: createNewTenant } = useCreateTenant();
    const { isPending: deleteTenantPending, mutateAsync: deleteTenant } = useDeleteenant();
    const { isPending: assignUserToTenantPending, mutateAsync: assignUserToTenant } =
        useAssignUserToTenant();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const [assignUser, setAssignUser] = useState<User | null>(null);

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<{ name: string }>({ name: "" });

    function handletoggleShowCreate() {
        setShowCreate((prev) => !prev);
    }

    async function handleCreateTenant(formData: { name: string }) {
        setShowCreate((prev) => !prev);
        const { message, success } = await createNewTenant(formData);
        notify({ title: success ? "Success" : "Unsuccessfull", description: message });
        reset({ name: "" });
    }

    async function handleDeleteTenant({ tenantId }: { tenantId: string }) {
        const { message, success } = await deleteTenant({ tenantId });
        notify({ title: success ? "Success" : "Unsuccessfull", description: message });
    }

    async function handleAssignTenantToUser({ tenant }: { tenant: Tenant }) {
        if (!assignUser) return;

        const { success } = await assignUserToTenant({
            userId: assignUser.id,
            tenantId: tenant.id,
        });

        notify({
            title: success ? "Assigned!" : "Not Assigned",
            description: `${assignUser.name} assigned to ${tenant.name}`,
        });

        removeUserForTenantAssignInLocal();
        setAssignUser(null);
    }

    useEffect(() => {
        const user = getUserForTenantAssignFromLocal();
        if (user) {
            setAssignUser(user);
            notify({
                title: "Ready to assign tenant",
                description: `Assign a tenant to ${user.name}`,
            });
        }
    }, []);

    useEffect(() => {
        if (!fetchedTenantsResponse) return;

        const { message, success, tenants: fetchedTenants } = fetchedTenantsResponse;

        if (success && fetchedTenants) {
            notify({ title: "Success", description: message });
            setTenants(fetchedTenants);
        }
    }, [fetchedTenantsResponse]);

    return (
        <div className="flex flex-col items-center w-[95%] md:w-[400px] mx-auto gap-4 ">
            <h1 className="text-xl font-bold border-b border-gray-400">Tenants</h1>

            {isLoading && <span>loading...</span>}
            {tenants?.length === 0 && <div>No users found </div>}

            <div className="w-full p-2 flex justify-center">
                <Button text="Create tenant" onClick={handletoggleShowCreate} />
            </div>

            {showCreate && (
                <div className="border border-gray-300 w-full p-2 rounded-md">
                    <form
                        onSubmit={handleSubmit(handleCreateTenant)}
                        className="mt-4 flex flex-col gap-3"
                    >
                        <div>
                            <label htmlFor="name">Tenant name</label>
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
                            <Button
                                type="submit"
                                text="Create"
                                disabled={createTenantPending}
                                className="text-green-900"
                            />
                        </div>
                    </form>
                </div>
            )}

            <ul className="w-full flex flex-col p-2">
                {tenants?.map((tenant) => (
                    <li
                        key={tenant.id}
                        className="flex justify-between border-b border-gray-200 p-2 hover:bg-blue-100 cursor-pointer rounded-md"
                    >
                        <span>{tenant.name}</span>

                        {assignUser ? (
                            <Button
                                text={`Assign to ${assignUser.name}`}
                                className="p-1! px-2!"
                                onClick={() => handleAssignTenantToUser({ tenant })}
                                disabled={assignUserToTenantPending}
                            />
                        ) : (
                            <Button
                                text="Delete"
                                className="p-1! px-2!"
                                onClick={() => handleDeleteTenant({ tenantId: tenant.id })}
                                disabled={deleteTenantPending}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminTenant;
