import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { SearchBar } from '../../components/shared/SearchBar.tsx'
import { ProfessionalIcon } from '@/components/ui/new/ProfessionalIcon.tsx'
import { WaveBackgroundLayout } from '@/components/ui/new/wave/WaveBackground.tsx'
import CategoryCard from '@/components/ui/new/card/CategoryCard.tsx'
import { MenuMobile } from '@/components/ui/new/menu/MenuMobile.tsx'
import axios from 'axios';

interface AuthMeResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function Menu() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [specialistName, setSpecialistName] = useState('')

  useEffect(() => {
    // Try to get user info from localStorage first (faster)
    try {
      const userInfoString = localStorage.getItem("user_info");
      
      if (userInfoString) {
        const userInfo: AuthMeResponse = JSON.parse(userInfoString);
        if (userInfo.first_name) {
          setSpecialistName(userInfo.first_name);
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
            const specialistData = JSON.parse(localStorage.getItem("specialist_data") || '{}');
            console.log(specialistData);
            const response = await axios.get(
              `${import.meta.env.VITE_SERVER_URL}/specialists/${specialistData.specialist_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data) {
              // Store the complete user info object
              localStorage.setItem("specialist_data", JSON.stringify(response.data));
              setSpecialistName(response.data.specialist_name);
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
    navigate("/specialist" + path)
  }

  // Navigation handlers for the mobile menu
  const handleHomeClick = () => navigate('/specialist/menu');
  const handleNewCaseClick = () => navigate('/specialist/patient/create');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <WaveBackgroundLayout className="bg-[#F9FAFB]">
      <div className="flex justify-center items-center mt-6 mb-6">
        <ProfessionalIcon size={0.6} borderRadius="50%" />
      </div>
      <div className="text-center">
        <h1 className="text-[#0120AC] text-xl font-bold">
          Olá, {specialistName || 'especialista'}
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
          title="Pacientes"
          description="Avaliação de pacientes"
          onClick={() => handleNavigate('/patient/list')}
        />
        
        <CategoryCard 
          title="Histórico de avaliações"
          description="Casos já analisados"
          onClick={() => handleNavigate('/appointments')}
          theme="light_blue"
        />
      </div>
      
      {/* Use the reusable mobile menu with custom click handlers */}
      <MenuMobile 
        onHomeClick={handleHomeClick}
        onNewCaseClick={handleNewCaseClick}
        plusButtonLabel="Novo Paciente"
        plusButtonPath="/specialist/patient/create"
        homePath="/specialist/menu"
      />
    </WaveBackgroundLayout>
  )
}