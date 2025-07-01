import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { WaveBackgroundLayout } from '@/components/ui/new/wave/WaveBackground.tsx'
import CategoryCard from '@/components/ui/new/card/CategoryCard.tsx'
import { MenuMobile } from '@/components/ui/new/menu/MenuMobile.tsx'
import { PatientIcon } from '@/components/ui/new/PatientIcon.tsx'

interface AuthMeResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function Menu() {
  const navigate = useNavigate()
  const [patientName, setPatientName] = useState('')

  useEffect(() => {
    // Try to get user info from localStorage first (faster)
      const patientName = localStorage.getItem("patient_name");
      
      if (patientName) {
          setPatientName(patientName);
        }

      }, []);

  const handleNavigate = (path: string) => {
    navigate("/patient" + path)
  }

  // Navigation handlers for the mobile menu
  const handleHomeClick = () => navigate('/patient/menu');
  const handleNewCaseClick = () => navigate('/patient/wounds');

  return (
    <WaveBackgroundLayout className="bg-[#F9FAFB]">
      <div className="flex justify-center items-center mt-6 mb-6">
        <PatientIcon size={0.6} borderRadius="50%" />
      </div>
      <div className="text-center">
        <h1 className="text-[#0120AC] text-xl font-bold">
          Olá, {patientName || 'paciente'}
        </h1>
      </div>
      
      
      <div className="px-4 md:px-6 lg:px-8 mb-8 mt-4">
        <h2 className="text-[#0120AC] text-md font-semibold text-left">Categorias</h2>
      </div>

      <div className="px-4 md:px-6 lg:px-8 space-y-4 pb-24">
        <CategoryCard 
          title="Feridas"
          description="Acesse suas feridas"
          onClick={() => handleNavigate('/wounds')}
        />
      </div>
      
      {/* Use the reusable mobile menu with custom click handlers */}
      <MenuMobile 
        onHomeClick={handleHomeClick}
        onNewCaseClick={handleNewCaseClick}
        plusButtonLabel="Nova atualização"
        plusButtonPath= "/patient/wounds"
        homePath="/patient/menu"
      />
    </WaveBackgroundLayout>
  )
}