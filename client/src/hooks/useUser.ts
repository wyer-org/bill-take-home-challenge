import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile } from "../services/user-service";
import { MutationKeys, QueryKeys } from "../libs/query-keys";
import { getUnverifiedUsers, verifyUser } from "../services/admin-service";

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

export function useUser() {
    return {
        useGetUserProfileQuery,
        useGetUnverifiedUsers,
        useVerifyUser,
    };
}
