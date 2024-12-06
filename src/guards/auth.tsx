import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@/lib/hooks/use-user";

export function AuthGuard() {
    const {id, isLoading, error} = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading) {
            if (error || !id) {
                if (location.pathname !== "/login") {
                    console.log("Redirecting to /login...");
                    navigate("/login");
                }
            } else if (location.pathname === "/") {
                console.log("Redirecting authenticated user to /patient/list...");
                navigate("/patient/list");
            }
        }
    }, [isLoading, error, id, navigate, location]);

    if (isLoading) {
        return <div>Loading...</div>; // Loading fallback
    }

    if (!id) {
        // If not authenticated, don't render the content and show nothing
        return null;
    }

    return <Outlet/>;
}
