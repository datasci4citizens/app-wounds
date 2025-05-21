import AppHeader from "@/components/ui/common/AppHeader";
import { Button } from "@/components/ui/new/Button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Define interface for user data
interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  authenticated: boolean;
}

export default function SpecialistSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    state: "",
    city: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          console.error("No access token found");
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get<UserData>(
          `${import.meta.env.VITE_SERVER_URL}/auth/me/`, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        const userData = response.data;
        
        // Construct full name from first_name and last_name
        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        
        // Update form with fetched data
        setFormData(prevData => ({
          ...prevData,
          fullName: fullName || prevData.fullName,
          email: userData.email || prevData.email
        }));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      // Here you would send the form data to your backend
      // For example:
      // const token = localStorage.getItem("access_token");
      // await axios.post(`${import.meta.env.VITE_SERVER_URL}/specialist/profile/`, formData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // For now, just store in localStorage
      localStorage.setItem("specialist_info", JSON.stringify(formData));
      
      // Navigate to specialist menu after successful submission
      navigate("/specialist/menu");
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* App logo */}
      <div className="mt-6 mb-4">
        <AppHeader title="Informações pessoais" />
      </div>

      {/* Form fields */}
      <div className="w-full max-w-md px-10 space-y-3 mt-6">
        <div className="space-y-0.5">
          <label className="block text-gray-800 text-xs font-bold">Nome completo</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Nome"
            style={{ fontSize: '0.75rem' }}
          />
        </div>

        <div className="space-y-0.5">
          <label className="block text-gray-800 text-xs font-bold">Data de nascimento</label>
          <input
            type="text"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Data de nascimento"
            style={{ fontSize: '0.75rem' }}
          />
        </div>

        <div className="space-y-0.5">
          <label className="block text-gray-800 text-xs font-bold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            placeholder="Email"
            style={{ fontSize: '0.75rem' }}
          />
        </div>

        <div className="space-y-0.5">
          <label className="block text-gray-800 text-xs font-bold">Estado</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Estado"
            style={{ fontSize: '0.75rem' }}
          />
        </div>

        <div className="space-y-0.5">
          <label className="block text-gray-800 text-xs font-bold">Cidade</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Cidade"
            style={{ fontSize: '0.75rem' }}
          />
        </div>

        {/* Next button */}
        <div style={{ marginTop: '2.5rem' }} className="flex justify-center">
          <Button
            className="text-white text-sm w-[216px]"
            onClick={handleSubmit}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}