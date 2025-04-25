import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  const selectRole = (role: "patient" | "specialist") => {
    localStorage.setItem("user_role", role);
    navigate("/"); 
  };

  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center p-4'>    
      <Card className="w-full max-w-md shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className='text-center font-bold text-2xl'>Com quem estamos falando ?</CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex flex-col gap-6 items-center">
            <Button
              className="w-full bg-sky-900 mt-6 mb-6"
              onClick={() => {
                localStorage.setItem("user_role", "patient");
                navigate("/patient-signup");
              }}
            >
              Sou um paciente
            </Button>

            <Button
              className="w-full bg-sky-900 mt-6 mb-6"
              onClick={() => {
                localStorage.setItem("user_role", "specialist");
              }}
            >
              Sou um profissional
            </Button>
          </CardContent>
        </Card>
      </div>   
  );
}
