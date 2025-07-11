import AppHeader from "@/components/ui/common/AppHeader";
import { IconBubble } from "@/components/ui/new/general/IconBubble";
import { PatientIcon } from "@/components/ui/new/PatientIcon";
import { ProfessionalIcon } from "@/components/ui/new/ProfessionalIcon";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4">    
      
      <div className="mb-[48px] mt-[68px]">
      <AppHeader title="Com quem estamos falando?" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 items-center">
        {/* Patient section */}
        <div className="flex flex-col items-center gap-4">
          <IconBubble>
            <PatientIcon size={1} />
          </IconBubble>
          <button
            className="px-6 py-3 rounded-full bg-[#0120AC] text-white text-sm"
            onClick={() => {
              navigate("/patient-signup");
            }}
          >
            Sou um paciente
          </button>
        </div>

        {/* Separator */}
        <div className="my-2 text-[#0120AC] font-medium">
          ou
        </div>

        {/* Professional section */}
        <div className="flex flex-col items-center gap-4">
          <IconBubble>
            <ProfessionalIcon size={1} />
          </IconBubble>
          <button
            className="px-5 py-3 rounded-full bg-[#0120AC] text-white text-sm font-medium"
            onClick={() => {
              navigate("/specialist-signup");
            }}
          >
            Sou um profissional
          </button>
        </div>
      </div>
    </div>   
  );
}
