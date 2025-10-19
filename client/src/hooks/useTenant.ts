import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    assignUserToTenant,
    createTenant,
    deleteTenant,
    getTenants,
} from "../services/tenant-service";
import { MutationKeys, QueryKeys } from "../libs/query-keys";

export function useGetTenants(enabled = true) {
    return useQuery({
        queryKey: [QueryKeys.GET_TENANTS],
        queryFn: getTenants,
        staleTime: Infinity,
        enabled,
        retry: false,
    });
}

export function useCreateTenant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [MutationKeys.CREATE_TENANT],
        mutationFn: createTenant,
        retry: false,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_TENANTS] }),
    });
}

export function useDeleteenant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [MutationKeys.DELETE_TENANT],
        mutationFn: deleteTenant,
        retry: false,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_TENANTS] }),
    });
}

export function useAssignUserToTenant() {
    return useMutation({
        mutationKey: [MutationKeys.ASSIGN_USER_TO_TENANT],
        mutationFn: assignUserToTenant,
        retry: false,
    });
}

export function useTenant() {
    return { useGetTenants, useCreateTenant, useDeleteenant, useAssignUserToTenant };
}
