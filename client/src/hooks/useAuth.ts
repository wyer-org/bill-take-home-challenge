import { useMutation } from "@tanstack/react-query";
import { MutationKeys } from "../libs/query-keys";
import { initUserLogin, registerUser, verifyMagicLink } from "../services/auth-service";

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

export function useAuth() {
    return {
        useRegisterUserMutation,
        useInitLoginUserMutation,
        useVerifyMagicLinkMutation,
    };
}
