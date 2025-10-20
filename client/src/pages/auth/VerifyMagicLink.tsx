import AuthLayout from "../../layouts/AuthLayout";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useAuth, useVerifyMagicLinkMutation } from "../../hooks/useAuth";
import { notify } from "../../components/Toast";

function VerifyMagicLink() {
    const navigate = useNavigate();
    const { mutateAsync: verifyMagicLink, isPending } = useVerifyMagicLinkMutation();
    const { token } = useSearch({ from: "/auth/verify" });
    const [message, setMessage] = useState("");
    const { refetchUser } = useAuth();

    useEffect(() => {
        if (isPending) return;

        if (!token) {
            notify({ title: "Error", description: "Token not found" });
            return;
        }

        async function handleVerify() {
            try {
                const result = await verifyMagicLink(token);

                if (!result.success) {
                    notify({
                        title: "Unsuccessfull",
                        description: result.message || "Something went wrong",
                    });

                    setMessage(result.message || "Something went wrong");
                    return;
                }

                if (result?.success) {
                    notify({ title: "Success!!", description: result.message });
                    setMessage(result.message || "Success");

                    setTimeout(async () => {
                        await refetchUser();
                        navigate({ to: "/" });
                    }, 1500);
                }
            } catch {
                notify({ title: "Error", description: "An error occured" });
            }
        }

        handleVerify();
    }, []);

    return (
        <AuthLayout>
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                {isPending && <p>Verifying your account...</p>}
                {message && <span>{message}</span>}

                {!isPending && (
                    <Link to={`/auth/login/init`} className="text-blue-300">
                        Login
                    </Link>
                )}
            </div>
        </AuthLayout>
    );
}

export default VerifyMagicLink;
