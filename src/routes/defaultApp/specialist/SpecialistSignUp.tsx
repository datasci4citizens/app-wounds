import AppHeader from "@/components/ui/common/AppHeader";
import { Button } from "@/components/ui/new/Button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InputField } from "@/components/ui/new/general/InputField";
import { TermsWithPopup } from "@/components/ui/new/general/TermsWithPopup";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    if (!acceptedTerms) {
      alert("Você precisa aceitar os termos para continuar.");
      return;
    }

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
    <div className="fixed inset-0 flex flex-col">
      <WaveBackgroundLayout className="flex-1 bg-[#F9FAFB] overflow-y-auto">
        <div className="flex flex-col min-h-full">
          {/* Regular Header - will scroll with content */}
          <div className="z-10 bg-transparent pb-6 px-6 pt-4">
            <AppHeader title="Informações pessoais" />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 px-6 pb-6">
            <div className="w-full max-w-md mx-auto space-y-4">
              <InputField
                label="Nome completo"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nome"
              />
              <InputField
                label="Data de nascimento"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                placeholder="Data de nascimento"
              />
              <InputField
                label="Email"
                name="email"
                value={formData.email}
                readOnly
                placeholder="Email"
                type="email"
              />
              <InputField
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Estado"
              />
              <InputField
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Cidade"
              />
              <InputField
                label="Código do profissional"
                name="specialistCode"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Código do profissional"
              />

              {/* Termos e Condições */}
              <div className="mt-8">
                <TermsWithPopup onChange={setAcceptedTerms} />
              </div>

              {/* Next button */}
              <div className="mt-10 flex justify-center mb-10">
                <Button
                  className="text-white text-sm w-[216px]"
                  onClick={handleSubmit}
                  disabled={!acceptedTerms}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </WaveBackgroundLayout>
    </div>
  );
}