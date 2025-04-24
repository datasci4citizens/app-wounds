import { useUserRole } from "@/lib/hooks/use-user-role";
import PatientApp from "./apps/patientApp";
import SpecialistApp from "./apps/specialistApp";
import DefaultApp from "./apps/defaultApp";

export function App() {
  const role = useUserRole();

  if (role === "patient") return <PatientApp/>;
  if (role === "specialist") return <SpecialistApp/>;
  
  return <DefaultApp/>;
}
