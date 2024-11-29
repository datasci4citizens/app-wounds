import { createContext, useContext } from "react";

const ctx = createContext({ name: "" })

export const UserContextProvider = ctx.Provider;

export const useUser = () => {
    return useContext(ctx)
}