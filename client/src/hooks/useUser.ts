import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile } from "../services/user-service";
import { MutationKeys, QueryKeys } from "../libs/query-keys";
import { getUnverifiedUsers, getVerifiedUsers, verifyUser } from "../services/admin-service";
import { User } from "../types/user.types";

export const Tenant_User_Assign = "tenant_user_assign";

export function useGetUserProfileQuery(enabled = true) {
    return useQuery({
        queryKey: [QueryKeys.USER_PROFILE],
        queryFn: getUserProfile,
        staleTime: Infinity,
        enabled,
        retry: false,
    });
}

export function useGetUnverifiedUsers(enabled = true) {
    return useQuery({
        queryKey: [QueryKeys.GET_UNVERIFIED_USERS],
        queryFn: getUnverifiedUsers,
        enabled,
        retry: false,
    });
}

export function useGetVerifiedUsers(enabled = true) {
    return useQuery({
        queryKey: [QueryKeys.GET_VERIFIED_USERS],
        queryFn: getVerifiedUsers,
        enabled,
        retry: false,
    });
}

export function useVerifyUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [MutationKeys.VERIFY_USER],
        mutationFn: verifyUser,
        retry: false,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_UNVERIFIED_USERS] }),
    });
}

export function addUserForTenantAssignToLocal({ user }: { user: User }) {
    localStorage.setItem(Tenant_User_Assign, JSON.stringify(user));
}

export function removeUserForTenantAssignInLocal() {
    localStorage.removeItem(Tenant_User_Assign);
}

export function getUserForTenantAssignFromLocal() {
    try {
        const raw = localStorage.getItem(Tenant_User_Assign);
        if (!raw) return null;
        return JSON.parse(raw) as User;
    } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        return null;
    }
}

export function useUser() {
    return {
        useGetUserProfileQuery,
        useGetUnverifiedUsers,
        useVerifyUser,
        getUserForTenantAssignFromLocal,
        addUserForTenantAssignToLocal,
        removeUserForTenantAssignInLocal,
    };
}
