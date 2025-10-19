import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { User } from "../types/user.types";
import { createContext } from "react";
import { useGetUserProfileQuery } from "../hooks/useUser";

type State = {
    user?: User;
    isLoading: boolean;
    isError: boolean;
    isLoggedIn: boolean;
    isFetching: boolean;
    error: Error | null;
};

type Actions = {
    refetchUser: (options?: RefetchOptions) => Promise<QueryObserverResult<User, Error>>;
};

export type AuthContextStateActions = State & Actions;

export const AuthContext = createContext<Actions & State>({} as Actions & State);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const {
        data: user,
        isLoading,
        isError,
        isFetching,
        error,
        refetch: refetchUser,
    } = useGetUserProfileQuery();

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isError,
                isFetching,
                error: error ?? null,
                refetchUser,
                isLoggedIn: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
