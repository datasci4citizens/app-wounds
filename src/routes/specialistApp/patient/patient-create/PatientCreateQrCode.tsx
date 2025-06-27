import QRCode from 'react-qr-code'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CardContent } from '@/components/ui/card'
import { WaveBackgroundLayout } from '@/components/ui/new/wave/WaveBackground'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/new/general/Checkbox'
import { ProfessionalIcon } from '@/components/ui/new/ProfessionalIcon.tsx'
import { getBaseURL, postRequest } from '@/data/common/HttpExtensions'

export default function PatientCreateQrCode() {
  const location = useLocation()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [patientRegistered, setPatientRegistered] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Verificar se temos um código ou um patientId
      const stateData = location.state
      
      if (!stateData) {
        setError(true)
        return
      }
      
      // Se temos um código diretamente
      if (typeof stateData === 'string') {
        setCode(stateData)
        return
      }
      
      // Se temos um patientId
      if (stateData.patientId) {
        setLoading(true)
        try {
          const response = await postRequest(
            getBaseURL(`/auth/patient-bind/${stateData.patientId}/new/`),
            { arg: {} }
          )
          
          if (response && response.code) {
            setCode(response.code)
          } else {
            setError(true)
          }
        } catch (err) {
          console.error('Erro ao obter código:', err)
          setError(true)
        } finally {
          setLoading(false)
        }
      } else {
        setError(true)
      }
    }
    
    fetchData()
  }, [location.state])

  const handleBackToMenu = () => {
    navigate('/specialist/menu')
  }

  return (
    <WaveBackgroundLayout className="bg-[#F9FAFB]">
      <div className="flex justify-center items-center mt-6 mb-6">
        <ProfessionalIcon size={0.6} borderRadius="50%" />
      </div>  

      <CardContent className="flex flex-col items-center gap-6">
        {loading ? (
          <p className="text-[#0120AC] font-bold">Carregando código...</p>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500 font-bold mb-4">Código ou ID do paciente não fornecido</p>
            <Button
              type="button"
              className="w-[220px] bg-[#0120AC] text-white rounded-[20px] py-3"
              onClick={handleBackToMenu}
            >
              Voltar para o menu
            </Button>
          </div>
        ) : (
          <>
            <QRCode value={code} size={200} />

            <h1 className='text-3xl font-bold text-center break-words text-[#0120AC]'>{code}</h1>

            <p className="font-normal text-center text-sm text-[#1A3BCC]">
              Este código é único e deve ser utilizado apenas uma vez, em até 30 minutos. 
            </p>

            <div className="flex items-center mt-4">
              <Checkbox 
                id="patientRegistered"
                checked={patientRegistered}
                onCheckedChange={() => setPatientRegistered(!patientRegistered)}
                className="mr-2"
              />
              <label htmlFor="patientRegistered" className="text-[#1A3BCC] font-normal text-sm">
                Paciente já se cadastrou / vai se cadastrar depois 
              </label>
            </div>

            <div className="flex flex-col items-center mt-4">
              <Button
                type="button"
                className="w-[220px] bg-[#0120AC] text-white rounded-[20px] py-3"
                disabled={!patientRegistered}
                onClick={handleBackToMenu}
              >
                Voltar para o menu
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </WaveBackgroundLayout>
  )
}