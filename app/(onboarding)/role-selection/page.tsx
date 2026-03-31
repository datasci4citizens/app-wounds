"use client";

import { useRouter } from "next/navigation";
import { useUserStore, UserRole } from "@/store/userStore";
import { UserCircle, Stethoscope } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();
  const setRole = useUserStore((state) => state.setRole);
  const user = useUserStore((state) => state.user);

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    
    if (role === "Pr") {
      // Specialist - needs to complete registration
      router.push("/register-specialist");
    } else {
      // Patient - currently goes to timeline
      router.push("/timeline");
    }
  };

  // Extract first name from full name for greeting
  const firstName = user?.fullName?.split(' ')[0];

  return (
    <div className="flex flex-col min-h-[100dvh] px-6 pt-16 pb-8 bg-background">
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center">
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Olá{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="text-base text-muted-foreground">
            Para começarmos, por favor selecione o seu perfil.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => handleSelectRole("Pr")}
            className="w-full flex items-center p-4 border border-border rounded-2xl bg-white dark:bg-card active:scale-[0.98] transition-all group text-left shadow-sm"
          >
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mr-4 transition-colors">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-foreground transition-colors">Especialista</h2>
              <p className="text-sm text-muted-foreground leading-tight">
                Gerencie pacientes e tratamentos
              </p>
            </div>
          </button>

          <button
            disabled
            className="w-full flex items-center p-4 border border-border rounded-2xl bg-muted/50 dark:bg-muted/20 cursor-not-allowed opacity-60 text-left shadow-sm"
          >
            <div className="w-14 h-14 bg-muted text-muted-foreground rounded-xl flex items-center justify-center mr-4">
              <UserCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-muted-foreground">Paciente</h2>
              <p className="text-sm text-muted-foreground leading-tight">
                Em breve
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
