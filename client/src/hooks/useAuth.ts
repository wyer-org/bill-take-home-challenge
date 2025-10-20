import { useMutation } from "@tanstack/react-query";
import { MutationKeys } from "../libs/query-keys";
import { initUserLogin, logoutUser, registerUser, verifyMagicLink } from "../services/auth-service";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "@tanstack/react-router";

export function useRegisterUserMutation() {
    return useMutation({
        mutationKey: [MutationKeys.REGISTER_USER],
        mutationFn: registerUser,
    });
}

export function useInitLoginUserMutation() {
    return useMutation({
        mutationKey: [MutationKeys.INITI_USER_LOGIN],
        mutationFn: initUserLogin,
    });
}

export function useVerifyMagicLinkMutation() {
    return useMutation({
        mutationKey: [MutationKeys.INITI_USER_LOGIN],
        mutationFn: verifyMagicLink,
    });
}

export function useLogoutUser() {
    const { refetchUser } = useContext(AuthContext);
    const navigate = useNavigate();

    return useMutation({
        mutationKey: [MutationKeys.LOGOUT_USER],
        mutationFn: logoutUser,

        onSuccess: async () => {
            await refetchUser();
            navigate({ to: "/", replace: true });
        },

        onError: (error) => console.error("Logout failed:", error),
    });
}

export function useAuth() {
    return useContext(AuthContext);
}
