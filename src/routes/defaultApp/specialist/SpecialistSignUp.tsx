import AppHeader from "@/components/ui/common/AppHeader";
import { Button } from "@/components/ui/new/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SpecialistSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    state: "",
    city: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    // For now, just store in localStorage and navigate
    localStorage.setItem("specialist_info", JSON.stringify(formData));
    
    // Navigate to next page - you might want to change this destination
    navigate("/login"); 
  };

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
            onChange={handleInputChange}
            className="w-full py-1.5 px-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                onClick={() => handleSubmit()}
            >
                Próximo
           </Button>
        </div>
      </div>
    </div>
  );
}