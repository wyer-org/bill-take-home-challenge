import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../libs/query-keys";
import { getPermissions } from "../services/permission-service";

export function useGetPermissions(enabled = true) {
    return useQuery({
        queryKey: [QueryKeys.GET_PERMISSIONS],
        queryFn: getPermissions,
        staleTime: Infinity,
        enabled,
        retry: false,
    });
}

export function usePermissions() {
    return { useGetPermissions };
}
