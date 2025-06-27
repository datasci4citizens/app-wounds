import { Card } from "@/components/ui/card.tsx"
import type { Wound } from "@/data/common/Mapper.ts";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { useRef, useEffect, useState} from "react";
import { LoadingScreen, type LoadingScreenHandle } from '@/components/ui/new/loading/LoadingScreen';
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground.tsx";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import { getRegionDescription, getSubregionDescription, getWoundType } from "@/data/common/LocalDataMapper.tsx";
import { PatientIcon } from "@/components/ui/new/PatientIcon";

const fetchWoundsData = async (url: string): Promise<Wound[]> => {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Token de acesso não encontrado');
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar dados para ${url}:`, error);
    throw error;
  }
};


const WoundCard = ({wound, index}: { 
    wound: Wound; 
    index: number;
}) => {
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Função para buscar a imagem da ferida
    useEffect(() => {
        const fetchWoundImage = async () => {
            // Se a ferida não tiver image_id, não tente buscar
            if (!wound.image_id) {
                return;
            }
            
            setImageLoading(true);
            setImageError(false);
            
            try {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    throw new Error('Token de acesso não encontrado');
                }
                
                // 1. Primeiro buscar os metadados da imagem
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/images/${wound.image_id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`Erro ao buscar metadados da imagem: ${response.status}`);
                }
                
                // 2. Extrair a URL da imagem do JSON retornado
                const imageData = await response.json();
                console.log('Metadados da imagem:', imageData);
                
                if (!imageData.image_url) {
                    throw new Error('URL da imagem não encontrada na resposta');
                }
                
                // 3. Carregar a imagem real da URL fornecida
                const imageResponse = await fetch(imageData.image_url);
                if (!imageResponse.ok) {
                    throw new Error(`Erro ao carregar imagem da URL: ${imageResponse.status}`);
                }
                
                // 4. Criar um blob e URL para mostrar a imagem
                const imageBlob = await imageResponse.blob();
                const url = URL.createObjectURL(imageBlob);
                setImageUrl(url);
                
            } catch (error) {
                console.error('Erro ao carregar imagem da ferida:', error);
                setImageError(true);
            } finally {
                setImageLoading(false);
            }
        };
        
        fetchWoundImage();
        
        // Limpar URL criado quando o componente for desmontado
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [wound.image_id]);

    const handleCardClick = () => {
        navigate('/patient/wound/detail', {state: {wound_id: wound.wound_id}});
    };
    
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate('/patient/wound/add-update/image', {state: {wound_id: wound.wound_id, patient_id: wound.patient_id}});
    };

    return (
        <>
            <Card 
                onClick={handleCardClick} 
                className="mb-6 w-full rounded-2xl overflow-hidden border border-blue-100 bg-white cursor-pointer"
            >
                {/* Header section com nome e tipo da ferida */}
                <div className="p-4 bg-white">
                    <h3 className="text-sm text-blue-800 mb-1.5 font-semibold">{`Ferida ${index + 1}`}</h3>
                    <div className="space-y-0.5">
                        <div className="flex items-start">
                            <span className="text-xs text-blue-800 font-medium mr-1">Tipo:</span>
                            <span className="text-xs text-blue-600">{getWoundType(wound.type)}</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-xs text-blue-800 font-medium mr-1">Local:</span>
                            <span className="text-xs text-blue-600">{getRegionDescription(wound.region)}</span>
                        </div>
                        {wound.subregion && (
                            <div className="flex items-start">
                                <span className="text-xs text-blue-800 font-medium mr-1">Subregião:</span>
                                <span className="text-xs text-blue-600">{getSubregionDescription(wound.region, wound.subregion)}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Seção de imagem - modificada para mostrar a imagem real quando disponível */}
                <div className="bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
                    {imageLoading ? (
                        // Indicador de carregamento
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
                            <p className="text-xs text-gray-500 mt-2">Carregando imagem...</p>
                        </div>
                    ) : imageUrl && !imageError ? (
                        // Imagem carregada com sucesso
                        <img
                            src={imageUrl}
                            alt={`Imagem da ferida ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        // Placeholder para quando não há imagem ou ocorreu erro
                        <div className="flex flex-col items-center">
                            {/* Triangle on top */}
                            <div className="w-10 h-10 mb-2"> 
                                <div className="w-0 h-0 mx-auto
                                    border-l-[18px] border-l-transparent
                                    border-b-[30px] border-b-gray-400
                                    border-r-[18px] border-r-transparent">
                                </div>
                            </div>
                            
                            {/* Square and circle side */}
                            <div className="flex items-center justify-center space-x-8">
                                <div className="w-9 h-9 bg-gray-400"></div>
                                <div className="w-9 h-9 bg-gray-400 rounded-full"></div>
                            </div>
                            
                            {/* Mensagem de erro, se aplicável */}
                            {imageError && wound.image_id && (
                                <p className="text-xs text-red-500 mt-2">Erro ao carregar imagem</p>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Care instructions section */}
                <div className="p-4 pt-2 border-t border-blue-50">
                    <h4 className="text-xs text-blue-800 font-medium mb-1.5">Instruções para o cuidado</h4>
                    <p className="text-xs text-blue-600">
                        {/* {wound.notes || "Sem instruções específicas registradas."} */}
                        {"Sem instruções específicas registradas."}
                    </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end p-4 gap-2">
                    <button 
                        onClick={handleEdit}
                        className="py-1 px-6 text-xs bg-blue-800 text-white font-normal rounded-full"
                    >
                        Atualizar
                    </button>
                </div>
            </Card>
        </>
    );
};

export default function PatientsWounds() {
    const location = useLocation();
    const loadingRef = useRef<LoadingScreenHandle>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Obter patient_id do localStorage ou do state
    const patient_id = location.state?.patient_id as number || localStorage.getItem('patient_id') ? Number(localStorage.getItem('patient_id')) : undefined;
    
    useEffect(() => {
        // Show loading screen on mount
        loadingRef.current?.show();
    }, [patient_id]);

    const {
        data: _wounds, 
        isLoading: isLoadingWounds, 
        error: woundError,
    } = useSWR<Wound[]>(
        patient_id ? `${import.meta.env.VITE_SERVER_URL}/wounds?patient_id=${patient_id}` : null,
        fetchWoundsData,
        {
            onSuccess: () => {
                // Handle loading state in combined useEffect below
            },
            onError: (error) => {
                console.error("Error fetching wound data:", error);
                setError("Erro ao carregar feridas");
            }
        }
    );

    useEffect(() => {
        if (!isLoadingWounds) {
            const timer = setTimeout(() => {
                loadingRef.current?.hide();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isLoadingWounds]);

    useEffect(() => {
        if (woundError) {
            loadingRef.current?.hide();
        }
    }, [woundError]);

    const wounds = _wounds || [];

    return (
        <>
            {/* Change the WaveBackgroundLayout styling */}
            <WaveBackgroundLayout className="absolute inset-0 overflow-auto">
                <div className="flex flex-col w-full min-h-full items-center px-4">
                    {/* Header with Professional Icon */}
                    <div className="flex justify-center items-center mt-6 mb-6">
                        <PatientIcon size={0.6} borderRadius="50%" />
                    </div>

                    {/* PageHeader component */}
                    <div className="flex w-full items-center justify-between mb-4">
                        <PageTitleWithBackButton 
                            title="Feridas Cadastradas" 
                            backPath="/patient/menu"
                            className="mb-0 mt-0 flex-1"
                        />
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="w-full bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}
                    
                    <div className="w-full">
                        {isLoadingWounds ? (
                            <p className="text-center py-8">Carregando feridas...</p>
                        ) : wounds.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Nenhuma ferida cadastrada para este paciente.
                            </div>
                        ) : (
                            wounds.map((wound, index) => (
                                <WoundCard 
                                    wound={wound} 
                                    index={index} 
                                    key={wound.wound_id}
                                />
                            ))
                        )}
                    </div>
                    

                </div>
            </WaveBackgroundLayout>
            
            <LoadingScreen ref={loadingRef} />
        </>
    );
}
