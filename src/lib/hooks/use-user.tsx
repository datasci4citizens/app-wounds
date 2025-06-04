import { createContext, useContext} from "react";
import type { ReactNode } from "react";
import useSWR from "swr";

interface UserContext {
    credentials?: {
        token: string;
        refresh_token: string | null;
        token_uri: string;
        client_id: string;
        client_secret: string;
    };
    email?: string;
    id?: number;
    state?: string;
    isLoading: boolean;
    error?: any;
}

const UserContext = createContext<UserContext | null>(null);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
    const { data, error, isLoading } = useSWR<UserContext>('/auth/me');

    const value: UserContext = {
        ...data, // Spread the fetched user data
        isLoading,
        error,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserContextProvider");
    }
    return context;
};