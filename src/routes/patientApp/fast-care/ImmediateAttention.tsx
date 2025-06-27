import { useState } from "react";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import { PatientIcon } from "@/components/ui/new/PatientIcon";
import { Button } from "@/components/ui/new/Button";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/new/general/Checkbox";
import { Textarea } from "@/components/ui/textarea";

// This was left unused since it needs refinement. Open points:
// - What it should be called
// - Communication model (messaging, push notification, whatsapp, email etc)
// - Reponse time SLAs

export default function ImmediateAttention() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [woundChanges, setWoundChanges] = useState({
    increased: false,
    redder: false,
    discharge: false,
    morePain: false,
    hotSkin: false
  });
  
  const [hasFever, setHasFever] = useState(false);
  
  const [changeTime, setChangeTime] = useState({
    today: false,
    yesterday: false,
    days2to3: false,
    moreThan3days: false
  });
  
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleWoundChange = (key: keyof typeof woundChanges) => {
    setWoundChanges(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTimeChange = (key: keyof typeof changeTime) => {
    // Reset all options first
    const resetOptions = {
      today: false,
      yesterday: false,
      days2to3: false,
      moreThan3days: false
    };
    
    // Then set the selected one
    setChangeTime({
      ...resetOptions,
      [key]: true
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Prepare data to send
      const formData = {
        woundChanges,
        hasFever,
        changeTime,
        additionalInfo,
        timestamp: new Date().toISOString()
      };
      
      // Log the data (would be sent to API in production)
      console.log("Sending data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to confirmation page
      navigate("/patient/fast-care/confirmation");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Ocorreu um erro ao enviar os dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <WaveBackgroundLayout className="bg-[#F9FAFB] overflow-y-auto">
      <div className="flex justify-center items-center mt-6 mb-6">
        <PatientIcon size={0.6} borderRadius="50%" />
      </div>  

      <PageTitleWithBackButton 
        title={"Atenção Imediata"} 
        backPath="/patient/fast-care"
      />      

      <div className="px-6 py-4 flex flex-col">
        {/* Wound changes section */}

        <span className=" py-10 font-bold"> UNDER CONSTRUCTION : ONLY A SKETCH</span>
        <div className="mb-6">
          <h2 className="text-[#0120AC] font-medium font-bold text-lg mb-4">Notou alguma mudança na ferida?</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="increased" className="text-[#0120AC] font-normal">
                Aumentou de tamanho
              </label>
              <Checkbox 
                id="increased"
                checked={woundChanges.increased}
                onCheckedChange={() => handleWoundChange('increased')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="redder" className="text-[#0120AC] font-normal">
                Está mais vermelha ou inchada
              </label>
              <Checkbox 
                id="redder"
                checked={woundChanges.redder}
                onCheckedChange={() => handleWoundChange('redder')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="discharge" className="text-[#0120AC] font-normal">
                Está saindo pus ou secreção
              </label>
              <Checkbox 
                id="discharge"
                checked={woundChanges.discharge}
                onCheckedChange={() => handleWoundChange('discharge')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="morePain" className="text-[#0120AC] font-normal">
                Começou a doer mais
              </label>
              <Checkbox 
                id="morePain"
                checked={woundChanges.morePain}
                onCheckedChange={() => handleWoundChange('morePain')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="hotSkin" className="text-[#0120AC] font-normal">
                A pele ao redor ficou quente
              </label>
              <Checkbox 
                id="hotSkin"
                checked={woundChanges.hotSkin}
                onCheckedChange={() => handleWoundChange('hotSkin')}
              />
            </div>
          </div>
        </div>
        
        {/* Fever section */}
        <div className="mb-6">
          <h2 className="text-[#0120AC] font-medium font-bold text-lg mb-4">Você está com febre ou se sentindo mal?</h2>
          
          <div className="flex items-center justify-between">
            <label htmlFor="fever" className="text-[#0120AC] font-normal">
              Sim, estou com febre ou me sentindo mal
            </label>
            <Checkbox 
              id="fever"
              checked={hasFever}
              onCheckedChange={() => setHasFever(!hasFever)}
            />
          </div>
        </div>
        
        {/* Time since change section */}
        <div className="mb-6">
          <h2 className="text-[#0120AC] font-medium font-bold text-lg mb-4">Há quanto tempo você notou mudança?</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="today" className="text-[#0120AC] font-normal">
                Hoje
              </label>
              <Checkbox 
                id="today"
                checked={changeTime.today}
                onCheckedChange={() => handleTimeChange('today')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="yesterday" className="text-[#0120AC] font-normal">
                Ontem
              </label>
              <Checkbox 
                id="yesterday"
                checked={changeTime.yesterday}
                onCheckedChange={() => handleTimeChange('yesterday')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="days2to3" className="text-[#0120AC] font-normal">
                Há 2-3 dias
              </label>
              <Checkbox 
                id="days2to3"
                checked={changeTime.days2to3}
                onCheckedChange={() => handleTimeChange('days2to3')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="moreThan3days" className="text-[#0120AC] font-normal">
                Mais de 3 dias
              </label>
              <Checkbox 
                id="moreThan3days"
                checked={changeTime.moreThan3days}
                onCheckedChange={() => handleTimeChange('moreThan3days')}
              />
            </div>
          </div>
        </div>
        
        {/* Additional information section */}
        <div className="mb-8">
          <h2 className="text-[#0120AC] font-medium font-bold text-lg mb-4">Deseja relatar algo mais ao especialista?</h2>
          
          <Textarea
            placeholder="Descreva aqui qualquer informação adicional que considere importante..."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="min-h-[120px] border-none focus:ring-0 text-[#0120AC] placeholder:text-[#A6BBFF]"
          />
        </div>
        
        {/* Submit button */}
        <div className="flex justify-center mb-10">
          <Button
            className="w-full max-w-xs bg-[#0120AC] text-white rounded-[20px] py-3"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar para avaliação"}
          </Button>
        </div>
      </div>
    </WaveBackgroundLayout>
  );
}