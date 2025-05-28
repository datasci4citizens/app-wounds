import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { SearchBar } from '../../components/shared/SearchBar.tsx'
import { ProfessionalIcon } from '@/components/ui/new/ProfessionalIcon.tsx'
import { WaveBackgroundLayout } from '@/components/ui/new/wave/WaveBackground.tsx'
import CategoryCard from '@/components/ui/new/card/CategoryCard.tsx';
import axios from 'axios';

interface AuthMeResponse {
  first_name: string;
  last_name: string;
  email: string;
}

export default function Menu() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [specialistName, setSpecialistName] = useState('')

  useEffect(() => {
    // Try to get name from localStorage first (faster)
    const storedName = localStorage.getItem("provider_name");
    
    if (storedName) {
      setSpecialistName(storedName);
    } else {
      // Fetch user data from API if not available in localStorage
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem("access_token");
          
          if (!token) {
            console.error("No access token found");
            return;
          }
          
          const response = await axios.get<AuthMeResponse>(
            `${import.meta.env.VITE_SERVER_URL}/auth/me/`,
              { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.first_name) {
            setSpecialistName(response.data.first_name);
            localStorage.setItem("provider_name", response.data.first_name);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };
      
      fetchUserData();
    }
  }, []);

  const handleNavigate = (path: string) => {
    navigate("/specialist" + path)
  }

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
      
      <div className="px-4 md:px-6 lg:px-8 mb-12 mt-16">
        <h2 className="text-[#0120AC] text-md font-semibold text-left">Categorias</h2>
      </div>

      <div className="px-4 md:px-6 lg:px-8 space-y-4">
        <CategoryCard 
          title="Casos para avaliação"
          description="Pendentes"
          onClick={() => handleNavigate('/patient/list')}
        />
        
        <CategoryCard 
          title="Histórico de avaliações"
          description="Casos já analisados"
          onClick={() => handleNavigate('/appointments')}
          theme="light_blue"
        />
      </div>
    </WaveBackgroundLayout>
  )
}