import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@/lib/hooks/use-user";

export function AuthGuard() {
    const { credentials, id, isLoading, error } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const isDev = import.meta.env.DEV;

    useEffect(() => {
        if (!isLoading && !isDev) {
            if (error || !credentials?.token || !id) {
                if (location.pathname !== "/login") {
                    console.log("Redirecting to /login...");
                    navigate("/login");
                }
            } else if (location.pathname === "/") {
                console.log("Redirecting authenticated user to /patient/list...");
                navigate("/patient/list");
            }
        }
    }, [isLoading, error, credentials, id, navigate, location, isDev]);

    if (isLoading && !isDev) {
        return <div>Loading...</div>;
    }

    if (!isDev && (!credentials?.token || !id)) {
        return null;
    }

    return <Outlet />;
}