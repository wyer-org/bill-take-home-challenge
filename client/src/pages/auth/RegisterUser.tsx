import ErrorMessage from "../../components/ErrorMessage";
import FormInput from "../../components/FormInput";
import { useCustomForm } from "../../hooks/useCustomForm";
import AuthLayout from "../../layouts/AuthLayout";
import { validateIsEmail } from "../../libs/validation";
import { RegisterUserDto } from "../../types/user.types";
import { Link } from "@tanstack/react-router";
import { notify } from "../../components/Toast";
import { useRegisterUserMutation } from "../../hooks/useAuth";

function RegisterUser() {
    const { mutateAsync: registerUser, error, isPending } = useRegisterUserMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<RegisterUserDto>({ email: "bill@mail.com", name: "bill yengo" });

    async function handleRegisterUser(formData: RegisterUserDto) {
        try {
            const result = await registerUser(formData);
            console.log(result);
            if (result?.success) {
                notify({ title: "Success!!", description: result.message });
                setTimeout(() => (window.location.href = result.authUrl), 3000);
                return;
            }

            if (!result.success) {
                notify({ title: "Error", description: result.message });
            }
        } catch (error) {
            console.error("Register error:", error);
        }
    }

    return (
        <AuthLayout>
            <div className="h-[420px] w-[95%] md:w-[420px] flex flex-col justify-between gap-2 border border-gray-300 rounded-md p-4">
                <h1 className="text-2xl font-bold text-center">Register your account</h1>

                <form
                    onSubmit={handleSubmit(handleRegisterUser)}
                    className="flex-grow flex flex-col justify-between gap-2"
                >
                    <div className="flex flex-col gap-2 flex-grow justify-center ">
                        <div className="flex flex-col gap-1">
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
                        <div className="flex flex-col gap-1">
                            <label htmlFor="name">Name</label>
                            <FormInput
                                placeholder="Enter name"
                                {...register("name", { required: "Name is required" })}
                            />
                            <ErrorMessage error={errors.name} position="right" className="" />
                        </div>
                    </div>

                    {error && (
                        <ErrorMessage error={`User exists or some funny error`} position="center" />
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer w-fit mx-auto px-12 disabled:cursor-progress"
                    >
                        {isPending ? "Registering..." : "Register"}
                    </button>
                    {/* )} */}
                </form>

                <div className="flex flex-col items-center gap-2 mt-2">
                    <span>Already have an account?</span>
                    <Link to={`/auth/login/init`} className="text-blue-300">
                        Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

export default RegisterUser;
