import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  const selectRole = (role: "patient" | "specialist") => {
    localStorage.setItem("user_role", role);
    navigate("/"); 
  };

  return (
    <div className="flex flex-col h-full w-full items-center px-8">
        <div className="flex flex-col items-center w-full">
            <h1 className="text-2xl font-bold mb-4">Com quem estamos falando?</h1>
            <div className="relative w-full mt-12">
                 
      <Card className="w-full max-w-md shadow-sm border border-gray-200">
          <CardContent className="p-8 flex flex-col gap-6 items-center">
            <Button
              className="w-full bg-sky-900 mt-6 mb-6"
              onClick={() => selectRole("patient")}
            >
              Sou um paciente
            </Button>

            <Button
              className="w-full bg-sky-900 mt-6 mb-6"
              onClick={() => selectRole("specialist")}
            >
              Sou um profissional
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>

    
  );
}
