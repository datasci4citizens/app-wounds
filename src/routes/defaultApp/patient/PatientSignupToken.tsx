import { useState } from "react";
import { Search, QrCode} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppHeader from "@/components/ui/common/AppHeader";
import { IconTypcnKeyboard } from "@/components/ui/new/KeyBoardIcon";
import { getBaseURL, postRequest } from "@/data/common/HttpExtensions";
import { UserContextProvider, useUser } from "@/lib/hooks/use-user";

// Componente wrapper para fornecer o contexto do usuário
export default function PatientSignUpTokenWrapper() {
  return (
    <UserContextProvider>
      <PatientSignUpToken />
    </UserContextProvider>
  );
}

function PatientSignUpToken() {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  // Obter o email do usuário do contexto
  const { email, isLoading: userLoading } = useUser();

  const handleSearch = async () => {
    if (token.length !== 8) {
      setError('O código deve ter 8 caracteres.')
      return
    }
    
    setError('')
    setLoading(true)
    
    try {
      // Obter o email do localStorage se não estiver disponível no contexto
      const userEmail = email || localStorage.getItem('user_email');
      
      if (!userEmail) {
        setError('Email do usuário não encontrado.');
        return;
      }
      
      const response = await postRequest(
        getBaseURL(`/auth/patient-bind/`), 
        { arg: { code: token, email: userEmail } }
      )
      
      if (response.status === 200) {
        navigate('/patient/menu')
      } else {
        console.error("Erro ao validar código:", response)
        setError('Erro ao validar o código. Tente novamente.')
      }
    } catch (err) {
      console.error('Erro na requisição:', err)
      setError('Erro ao processar o código')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar mensagem de carregamento enquanto obtém os dados do usuário
  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-[#0120AC]">Carregando informações do usuário...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4 pb-32 overflow-auto">    
      <div className="mb-[16px] mt-[50px]">
        <AppHeader title="Código de Acesso" />
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="mb-2">
             <IconTypcnKeyboard height="100px" width="100px" />
          </div>
        <span className="w-[328px] text-justify font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#1A3BCC]">
          Digite o código de 8 dígitos fornecido pelo profissional para prosseguir com o cadastro
        </span>
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 items-center">
        <div className="w-4/5">
          <div className="bg-white rounded-md p-4 shadow-sm border border-[#A6BBFF]">
            <input
              type='text'
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder='Digite o código'
              className="text-[#1A3BCC] placeholder:text-[#A6BBFF] border-none outline-none"
            />
            {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-3 rounded-full bg-[#0120AC] text-white text-sm font-medium flex items-center justify-center"
        >
          <Search className="mr-2 h-5 w-5" />
          <span>{loading ? "Processando..." : "Buscar código"}</span>
        </button>

        <button
          className="px-5 py-3 rounded-full bg-white border border-[#0120AC] text-[#0120AC] text-sm font-medium flex items-center justify-center"
          onClick={() => {
            navigate("/patient-signup");
          }}
        >
          <QrCode className="mr-2 h-5 w-5" />
          <span>Escanear QR Code</span>
        </button>
      </div>
    </div>
  )
}