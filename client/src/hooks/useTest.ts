import { useQuery } from "@tanstack/react-query";
import { getTests } from "../services/test-service";

export function useFetchTests(enabled = true) {
    const fetchTests = useQuery({
        queryKey: ["GET_TESTS"],
        queryFn: getTests,
        staleTime: Infinity,
        enabled,
        retry: false,
    });

    return { fetchTests };
}
