import { Image } from "lucide-react"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSWRMutation from "swr/mutation";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import { PatientIcon } from "@/components/ui/new/PatientIcon";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import exudateTypeData from '@/localdata/exudate-type.json';

export default function WoundRecordDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id;
    const trackingRecordId = location.state?.tracking_record_id;
    
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Buscar detalhes do registro de acompanhamento da API
    const apiUrl = `${import.meta.env.VITE_SERVER_URL}/tracking-records/${trackingRecordId}/`;
    
    const {
        data: woundRecord,
        error,
        trigger,
        isMutating: isLoading
    } = useSWRMutation(
        apiUrl,
        async (url) => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Token de acesso não encontrado');
            }
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Falha ao buscar detalhes do registro');
            return response.json();
        }
    );

    // Verificação de parâmetros e carregamento inicial
    useEffect(() => {
        if (!woundId || !trackingRecordId) {
            console.error('Parâmetros necessários não encontrados:', { woundId, trackingRecordId });
            navigate('/patient/wounds');
            return;
        }
        
        trigger();
    }, [woundId, trackingRecordId, navigate, trigger]);

    // Função para buscar imagem da ferida
    useEffect(() => {
        if (!woundRecord || !woundRecord.image_id || isLoading) return;

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
                
                if (!imageData.image_url) {
                    throw new Error('URL da imagem não encontrada na resposta');
                }
                
                // Carregar a imagem
                const imageResponse = await fetch(imageData.image_url);
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

    // Se houver erro ou estiver carregando
    if (error) {
        return (
            <WaveBackgroundLayout className="absolute inset-0 overflow-auto bg-blue-50">
                <div className="flex flex-col w-full h-full items-center p-8">
                    <div className="flex justify-center items-center mt-6 mb-6">
                        <PatientIcon size={0.6} borderRadius="50%" />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <p className="text-red-500 font-medium">Erro ao carregar os detalhes da atualização.</p>
                        <button
                            onClick={() => navigate('/patient/wound/detail', {state: {wound_id: woundId}})}
                            className="mt-4 bg-blue-800 text-white px-4 py-2 rounded-md"
                        >
                            Voltar para a ferida
                        </button>
                    </div>
                </div>
            </WaveBackgroundLayout>
        );
    }
    
    if (isLoading || !woundRecord) {
        return (
            <WaveBackgroundLayout className="absolute inset-0 overflow-auto bg-blue-50">
                <div className="flex flex-col w-full h-full items-center p-8">
                    <div className="flex justify-center items-center mt-6 mb-6">
                        <PatientIcon size={0.6} borderRadius="50%" />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <p className="text-gray-500">Carregando detalhes da atualização...</p>
                    </div>
                </div>
            </WaveBackgroundLayout>
        );
    }

    // Funções para mapear campos corretamente
    

    const getExudateTypeDescription = (type: string) => {
        if (!type) return '';
        return (exudateTypeData as Record<string, string>)[type] || type;
    };
    

    // Renderizar os detalhes do registro
    return (
        <WaveBackgroundLayout className="absolute inset-0 overflow-auto bg-blue-50">
            <div className="flex flex-col w-full min-h-full items-center px-4">
                {/* Header com ícone do profissional */}
                <div className="flex justify-center items-center mt-6 mb-6">
                    <PatientIcon size={0.6} borderRadius="50%" />
                </div>
                
                {/* Título da página com botão voltar */}
                <PageTitleWithBackButton 
                    title={"Detalhes da Atualização"} 
                    onBackClick={() => navigate('/patient/wound/detail', {state: {wound_id: woundId}})}
                    className="w-full mb-4"
                />

                <div className="flex flex-col w-full max-w-xl mb-6">
                    {/* Data da atualização */}
                    <p className="text-sm text-blue-800 font-medium text-center mb-4">
                        {woundRecord.updated_at ? 
                            (() => {
                                const updatedAtStr = woundRecord.updated_at;
                                const year = updatedAtStr.substring(0, 4);
                                const month = updatedAtStr.substring(5, 7);
                                const day = updatedAtStr.substring(8, 10);
                                const hour = updatedAtStr.substring(11, 13);
                                const minute = updatedAtStr.substring(14, 16);
                                const second = updatedAtStr.substring(17, 19);
                                
                                return `${day}/${month}/${year} - ${hour}:${minute}:${second}`;
                            })() 
                            : "Data não disponível"
                        }
                    </p>
                    
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
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
                            </div>

                            <div>
                                <p className="font-medium text-sm">Nível da dor</p>
                                <p className="text-xs">{woundRecord.pain_level}/10</p>
                            </div>

                            <div>
                                <p className="font-medium text-sm">Cor do pus</p>
                                <p className="text-xs">
                                    {getExudateTypeDescription(woundRecord.exudate_type)}
                                </p>
                            </div>
                        </div>

                        <hr className="border-t border-gray-200 my-4" />

                        {/* Informações complementares */}
                        <h2 className="text-lg font-bold text-blue-800 mb-4">Informações complementares</h2>

                        <div className="space-y-4 text-blue-800 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="font-medium text-sm">Febre nas últimas 24h</p>
                                    <p className="text-xs">{woundRecord.had_a_fever ? "Sim" : "Não"}</p>
                                </div>

                                {woundRecord.dressing_changes_per_day && (
                                    <div>
                                        <p className="font-medium text-sm">Trocas de curativo por dia</p>
                                        <p className="text-xs">{woundRecord.dressing_changes_per_day}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Observações adicionais */}
                        {woundRecord.extra_notes && (
                            <>
                                <hr className="border-t border-gray-200 my-4" />
                                <h2 className="text-lg font-bold text-blue-800 mb-4">Relato ao especialista</h2>

                                <div className="space-y-4 text-blue-800">
                                    <div>
                                        <p className="text-xs">{woundRecord.extra_notes}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </WaveBackgroundLayout>
    );
}

