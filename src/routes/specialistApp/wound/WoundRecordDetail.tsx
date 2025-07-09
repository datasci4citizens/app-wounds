import { Image } from "lucide-react"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import { ProfessionalIcon } from "@/components/ui/new/ProfessionalIcon";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import tissueTypeData from '@/localdata/tissue-type.json';
import exudateTypeData from '@/localdata/exudate-type.json';
import exudateAmountData from '@/localdata/exudate-amount.json';
import skinAroundData from '@/localdata/skin-around.json';
import woundEdgesData from '@/localdata/wound-edges.json';

export default function WoundRecordDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id;
    // const trackingRecordId = location.state?.tracking_record_id; // Não utilizado
    const woundRecord = location.state?.woundRecord;
    
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Verificação de parâmetros
    useEffect(() => {
        if (!woundId || !woundRecord) {
            console.error('Parâmetros necessários não encontrados:', { woundId, woundRecord });
            // navigate('/specialist/dashboard');
            return;
        }
    }, [woundId, woundRecord, navigate]);

    // Função para buscar imagem da ferida
    useEffect(() => {
        if (!woundRecord?.image_id) return;

        const fetchImage = async () => {
            setImageLoading(true);
            setImageError(false);
            
            try {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    throw new Error('Token de acesso não encontrado');
                }
                
                // Buscar metadados da imagem
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/images/${woundRecord.image_id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`Erro ao buscar metadados da imagem: ${response.status}`);
                }
                
                const imageData = await response.json();
                
                if (!imageData.image) {
                    throw new Error('URL da imagem não encontrada na resposta');
                }
                
                // Carregar a imagem
                const imageResponse = await fetch(imageData.image);
                if (!imageResponse.ok) {
                    throw new Error(`Erro ao carregar imagem: ${imageResponse.status}`);
                }
                
                const imageBlob = await imageResponse.blob();
                const url = URL.createObjectURL(imageBlob);
                setImageUrl(url);
                
            } catch (error) {
                console.error('Erro ao carregar imagem:', error);
                setImageError(true);
            } finally {
                setImageLoading(false);
            }
        };
        
        fetchImage();
        
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [woundRecord?.image_id]);

    // Se não houver registro, mostrar mensagem de erro
    if (!woundRecord) {
        return (
            <WaveBackgroundLayout className="absolute inset-0 overflow-auto bg-blue-50">
                <div className="flex flex-col w-full h-full items-center p-8">
                    <div className="flex justify-center items-center mt-6 mb-6">
                        <ProfessionalIcon size={0.6} borderRadius="50%" />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <p className="text-red-500 font-medium">Erro ao carregar os detalhes da atualização.</p>
                        <button
                            onClick={() => navigate('/specialist/wound/detail', {state: {wound_id: woundId}})}
                            className="mt-4 bg-blue-800 text-white px-4 py-2 rounded-md"
                        >
                            Voltar para a ferida
                        </button>
                    </div>
                </div>
            </WaveBackgroundLayout>
        );
    }

    // Funções para mapear campos corretamente
    const getSkinAroundDescription = (code: string) => {
        if (!code) return '-';
        
        // Use o mapeamento correto do arquivo JSON para skin_around
        return (skinAroundData as Record<string, string>)[code] || code;
    };
    
    const getWoundEdgesDescription = (code: string) => {
        if (!code) return '-';
        
        // Use o mapeamento correto do arquivo JSON para wound_edges
        // Se não existir o arquivo JSON específico, podemos usar o tissue_type como fallback
        return (woundEdgesData as Record<string, string>)[code] || 
               (tissueTypeData as Record<string, {type: string}>)[code]?.type || 
               code;
    };
    
    const getTissueTypeDescription = (code: string) => {
        if (!code) return '-';
        return (tissueTypeData as Record<string, {type: string}>)[code]?.type || code;
    };
    
    const getExudateTypeDescription = (type: string) => {
        if (!type) return '-';
        return (exudateTypeData as Record<string, string>)[type] || type;
    };
    
    const getExudateAmountDescription = (amount: string) => {
        if (!amount) return '-';
        return (exudateAmountData as Record<string, string>)[amount] || amount;
    };

    // Renderizar os detalhes do registro
    return (
        <WaveBackgroundLayout className="absolute inset-0 overflow-auto bg-blue-50">
            <div className="flex flex-col w-full min-h-full items-center px-4">
                {/* Header com ícone do profissional */}
                <div className="flex justify-center items-center mt-6 mb-6">
                    <ProfessionalIcon size={0.6} borderRadius="50%" />
                </div>
                
                {/* Título da página com botão voltar */}
                <PageTitleWithBackButton 
                    title={"Detalhes da Atualização"} 
                    onBackClick={() => navigate('/specialist/wound/detail', {state: {wound_id: woundId}})}
                    className="w-full mb-4"
                />
                
                <div className="flex flex-col w-full max-w-xl mb-6">
                    {/* Data da atualização */}
                    <p className="text-sm text-blue-800 font-medium text-center mb-4">
                        {(() => {
                            // Usar track_date se updated_at não estiver disponível
                            const dateStr = woundRecord.updated_at || woundRecord.track_date;
                            
                            if (!dateStr) return "Data não disponível";
                            
                            try {
                                // Se a string tiver formato de data completo com hora
                                if (dateStr.length > 10) {
                                    const year = dateStr.substring(0, 4);
                                    const month = dateStr.substring(5, 7);
                                    const day = dateStr.substring(8, 10);
                                    
                                    // Verificar se tem informação de hora
                                    if (dateStr.length >= 19) {
                                        const hour = dateStr.substring(11, 13);
                                        const minute = dateStr.substring(14, 16);
                                        const second = dateStr.substring(17, 19);
                                        return `${day}/${month}/${year} - ${hour}:${minute}:${second}`;
                                    } else {
                                        return `${day}/${month}/${year}`;
                                    }
                                } else {
                                    // Formato simples YYYY-MM-DD
                                    const [year, month, day] = dateStr.split('-');
                                    return `${day}/${month}/${year}`;
                                }
                            } catch (error) {
                                console.error('Erro ao formatar data:', error);
                                return dateStr; // Retorna a string original em caso de erro
                            }
                        })()
                        }
                    </p>
                    
                    <div className="bg-white rounded-2xl p-5 shadow-sm">

                        <div>
                            <h3 className="text-base font-semibold text-blue-800 mb-0">Paciente</h3>
                            <p className="text-sm text-blue-800">{localStorage.getItem('currentPatientName') || ""}</p>
                        </div>

                        <hr className="border-t border-gray-200 my-4" />

                        {/* Seção da imagem */}
                        {woundRecord.image_id && (
                            <div className="mb-6">
                                <div className="bg-gray-100 h-64 flex items-center justify-center overflow-hidden rounded-md">
                                    {imageLoading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            <p className="text-xs text-gray-500 mt-2">Carregando imagem...</p>
                                        </div>
                                    ) : imageUrl && !imageError ? (
                                        <img
                                            src={imageUrl}
                                            alt="Imagem da ferida"
                                            className="w-full h-full object-contain"
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full">
                                            <Image className="w-16 h-16 text-gray-400"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Informações básicas */}
                        <h2 className="text-lg font-bold text-blue-800 mb-4">Informações básicas</h2>

                        <div className="space-y-4 text-blue-800 mb-6">
                            <div>
                                <p className="font-medium text-sm">Tamanho</p>
                                {woundRecord.length && woundRecord.width ? (
                                    <div className="flex items-center mt-1">
                                        <div className="flex flex-row items-center bg-blue-50 rounded-md px-2 py-1">
                                            <span className="text-xs text-blue-800 font-medium">{woundRecord.length}</span>
                                            <span className="text-xs text-blue-500 mx-1">×</span>
                                            <span className="text-xs text-blue-800 font-medium">{woundRecord.width}</span>
                                            <span className="text-xs text-blue-500 ml-1">cm</span>
                                        </div>
                                        <span className="text-xs text-blue-400 ml-2">
                                            (Área: {(Number(woundRecord.length) * Number(woundRecord.width)).toFixed(2)} cm²)
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-xs">-</p>
                                )}
                            </div>

                            <div>
                                <p className="font-medium text-sm">Nível da dor</p>
                                <p className="text-xs">{woundRecord.pain_level ? `${woundRecord.pain_level}/10` : "-"}</p>
                            </div>

                            <div>
                                <p className="font-medium text-sm">Exsudato</p>
                                <p className="text-xs">
                                    {woundRecord.exudate_type || woundRecord.exudate_amount ? 
                                        `${getExudateTypeDescription(woundRecord.exudate_type)} - ${getExudateAmountDescription(woundRecord.exudate_amount)}` : 
                                        "-"}
                                </p>
                            </div>

                            <div>
                                <p className="font-medium text-sm">Tipo de tecido</p>
                                <p className="text-xs">
                                    {getTissueTypeDescription(woundRecord.tissue_type)}
                                </p>
                            </div>
                        </div>

                        <hr className="border-t border-gray-200 my-4" />

                        {/* Informações complementares */}
                        <h2 className="text-lg font-bold text-blue-800 mb-4">Informações complementares</h2>

                        <div className="space-y-4 text-blue-800 mb-6">
                            <div>
                                <p className="font-medium text-sm">Febre nas 24h anteriores</p>
                                <p className="text-xs">{woundRecord.had_a_fever ? "Sim" : "Não"}</p>
                            </div>

                            <div>
                                <p className="font-medium text-sm">Pele ao redor da ferida</p>
                                <p className="text-xs">{woundRecord.skin_around ? getSkinAroundDescription(woundRecord.skin_around) : "-"}</p>
                            </div>

                            <div>
                                <p className="font-medium text-sm">Bordas da ferida</p>
                                <p className="text-xs">{woundRecord.wound_edges ? getWoundEdgesDescription(woundRecord.wound_edges) : "-"}</p>
                            </div>
                        </div>

                        {/* Notas e orientações */}
                        {(woundRecord.extra_notes || woundRecord.guidelines_to_patient) && (
                            <>
                                <hr className="border-t border-gray-200 my-4" />
                                <h2 className="text-lg font-bold text-blue-800 mb-4">Anotações</h2>

                                <div className="space-y-4 text-blue-800">
                                    {woundRecord.extra_notes && (
                                        <div>
                                            <p className="font-medium text-sm">Observações</p>
                                            <p className="text-xs">{woundRecord.extra_notes}</p>
                                        </div>
                                    )}

                                    {woundRecord.guidelines_to_patient && (
                                        <div>
                                            <p className="font-medium text-sm">Orientações ao paciente</p>
                                            <p className="text-xs">{woundRecord.guidelines_to_patient}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </WaveBackgroundLayout>
    );
}
