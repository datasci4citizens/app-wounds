import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@/lib/hooks/use-user";

export function AuthGuard() {
    const { credentials, id, isLoading, error } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading) {
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
    }, [isLoading, error, credentials, id, navigate, location]);

    if (isLoading) {
        return <div>Loading...</div>; // Loading fallback
    }

    if (!credentials?.token || !id) {
        // If not authenticated, don't render the content and show nothing
        return null;
    }

    return <Outlet />;
}
