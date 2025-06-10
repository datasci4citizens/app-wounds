import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { SearchBar } from '../../components/shared/SearchBar.tsx'
import { WaveBackgroundLayout } from '@/components/ui/new/wave/WaveBackground.tsx'
import CategoryCard from '@/components/ui/new/card/CategoryCard.tsx'
import { MenuMobile } from '@/components/ui/new/menu/MenuMobile.tsx'
import axios from 'axios';
import { PatientIcon } from '@/components/ui/new/PatientIcon.tsx'

interface AuthMeResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

//Testing 

export default function Menu() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [patientName, setPatientName] = useState('')

  useEffect(() => {
    // Try to get user info from localStorage first (faster)
    try {
      const userInfoString = localStorage.getItem("user_info");
      
      if (userInfoString) {
        const userInfo: AuthMeResponse = JSON.parse(userInfoString);
        if (userInfo.first_name) {
          setPatientName(userInfo.first_name);
        }
      } else {
        // Fetch user data from API if not available in localStorage
        const fetchUserData = async () => {
          try {
            const token = localStorage.getItem("access_token");
            
            if (!token) {
              console.error("No access token found");
              return;
            }

            const response = await axios.get(
              `${import.meta.env.VITE_SERVER_URL}/patient/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data) {
              console.log("User data fetched successfully:", response.data);
              // Store the complete user info object
              localStorage.setItem("patient_data", JSON.stringify(response.data[0]));
              setPatientName(response.data[0].patient_name);
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);
          }
        };
        
        fetchUserData();
      }
    } catch (error) {
      console.error("Error parsing user info from localStorage:", error);
    }
  }, []);

  const handleNavigate = (path: string) => {
    navigate("/patient" + path)
  }

  // Navigation handlers for the mobile menu
  const handleHomeClick = () => navigate('/patient/menu');
  const handleNewCaseClick = () => navigate('/patient/wounds');
  const handleNotificationsClick = () => navigate('/patient/notifications');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

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
      
      <div className="mb-6 w-full mt-8 px-4 md:px-6 lg:px-8">
        <SearchBar 
          placeholder="" 
          value={searchQuery} 
          onChange={handleSearch} 
          onAddClick={() => handleNavigate('/create')}
          height="64px"
        />
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
        
        <CategoryCard 
          title="Estou Preocupado"
          description="Solicitar avaliação rápida"
          onClick={() => handleNavigate('/emergency')}
          theme="pink"
        />
      </div>
      
      {/* Use the reusable mobile menu with custom click handlers */}
      <MenuMobile 
        onHomeClick={handleHomeClick}
        onNotificationsClick={handleNotificationsClick}
        onNewCaseClick={handleNewCaseClick}
        plusButtonLabel="Nova atualização"
        plusButtonPath= "/patient/wounds"
        homePath="/patient/menu"
        notificationsPath="/patient/notifications"
      />
    </WaveBackgroundLayout>
  )
}