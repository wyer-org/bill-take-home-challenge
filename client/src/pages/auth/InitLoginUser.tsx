import { Link } from "@tanstack/react-router";
import ErrorMessage from "../../components/ErrorMessage";
import FormInput from "../../components/FormInput";
import { notify } from "../../components/Toast";
import { useInitLoginUserMutation } from "../../hooks/useAuth";
import { useCustomForm } from "../../hooks/useCustomForm";
import AuthLayout from "../../layouts/AuthLayout";
import { validateIsEmail } from "../../libs/validation";
import { InitLoginUserDto } from "../../types/user.types";

function InitLoginUser() {
    const { mutateAsync: initUserLogin, isPending } = useInitLoginUserMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<InitLoginUserDto>({ email: "admin@mail.com" });

    async function handleInitUserLogin(formData: InitLoginUserDto) {
        try {
            const result = await initUserLogin(formData);

            if (!result.success) {
                notify({ title: "Unsuccessfull", description: result.message });
                return;
            }

            if (result.success) {
                notify({ title: "Success!!", description: result.message });
                setTimeout(() => {
                    window.location.href = result.authUrl;
                }, 3000);
            }
        } catch (error: any) {
            console.error("Register error:", error);
        }
    }

    return (
        <AuthLayout>
            <div className=" h-[420px] w-[95%] md:w-[420px] flex flex-col justify-between gap-2 border border-gray-300 rounded-md p-4">
                <h1 className="text-2xl font-bold text-center">Init Login</h1>
                <form
                    onSubmit={handleSubmit(handleInitUserLogin)}
                    className="flex-grow flex flex-col justify-between gap-2"
                >
                    <div className="flex flex-col gap-1 mt-12">
                        <label htmlFor="email">Email</label>
                        <FormInput
                            placeholder="Enter email"
                            {...register("email", {
                                required: "Email is required",
                                validate: {
                                    containsSymbol: validateIsEmail,
                                },
                            })}
                        />
                        <ErrorMessage error={errors.email} position="right" className="" />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer w-fit mx-auto px-12 disabled:cursor-progress"
                    >
                        {isPending ? "Initializing..." : "Login"}
                    </button>
                </form>
                <div className="flex flex-col items-center gap-2 mt-2">
                    <span>Don't have an account?</span>
                    <Link to={`/auth/register`} className="text-blue-300">
                        Register
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

export default InitLoginUser;
