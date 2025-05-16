export function useUserRole(): "patient" | "specialist" | null {
    const stored = localStorage.getItem("user_role");
    if (stored === "patient" || stored === "specialist") return stored;
    return null;
  }
  