import { Image } from "lucide-react"
import exudateAmountData from '@/localdata/exudate-amount.json';
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
    
    const [imageUrl, setImageUrl] = useState<string | null>(location.state?.imageUrl || null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Buscar detalhes do registro de acompanhamento da API
    const apiUrl = `${import.meta.env.VITE_SERVER_URL}/tracking-records/${trackingRecordId}/`;
    
    // Usar o registro passado pelo state se disponível
    const woundRecordFromState = location.state?.woundRecord;
    // Usar a URL da imagem passada pelo state se disponível
    const imageUrlFromState = location.state?.imageUrl;
    
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
        // Se já temos a URL da imagem do state, não precisamos buscar novamente
        if (imageUrlFromState) {
            console.log('Usando URL da imagem do state:', imageUrlFromState);
            setImageUrl(imageUrlFromState);
            return;
        }
        
        // Usar o registro da API ou do state
        const record = woundRecord || woundRecordFromState;
        console.log('Tentando carregar imagem com:', { record, imageId: record?.image_id, imageUrl: record?.image_url });
        if (!record || (!record.image_id && !record.image_url) || isLoading) return;

        const fetchImage = async () => {
            setImageLoading(true);
            setImageError(false);
            
            try {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    throw new Error('Token de acesso não encontrado');
                }
                
                // Se já temos a URL da imagem diretamente no registro, usar ela
                if (record.image_url) {
                    console.log('Usando image_url diretamente do registro:', record.image_url);
                    const imageResponse = await fetch(record.image_url);
                    if (!imageResponse.ok) {
                        throw new Error(`Erro ao carregar imagem da URL: ${imageResponse.status}`);
                    }
                    
                    const imageBlob = await imageResponse.blob();
                    const url = URL.createObjectURL(imageBlob);
                    setImageUrl(url);
                    return;
                }
                
                // Caso contrário, buscar metadados da imagem
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/images/${record.image_id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`Erro ao buscar metadados da imagem: ${response.status}`);
                }
                
                const imageData = await response.json();
                
                if (!imageData.image_url && !imageData.image) {
                    throw new Error('URL da imagem não encontrada na resposta');
                }
                
                // Usar a URL da imagem que estiver disponível
                const imageUrl = imageData.image_url || imageData.image;
                
                // Carregar a imagem
                const imageResponse = await fetch(imageUrl);
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
    }, [woundRecord, woundRecordFromState, isLoading, imageUrlFromState]);

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
    
    if (isLoading && !woundRecordFromState) {
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
    

    const getExudateTypeDescription = (type: string | number) => {
        if (type === undefined || type === null) return '';
        // Converter para string para garantir que funcione com números
        const typeKey = String(type);
        return (exudateTypeData as Record<string, string>)[typeKey] || typeKey;
    };

    // Função para obter descrição da quantidade de exsudato atualizada para usar o JSON
    const getExudateAmountDescription = (amount: string | number) => {
        if (amount === undefined || amount === null) return '';
        
        // Converter para string para garantir que funcione com números
        const amountKey = String(amount);
        
        // Acessa diretamente a quantidade de exsudato do JSON importado
        const amountDescription = (exudateAmountData as Record<string, string>)[amountKey];
        
        // Retorna a descrição ou o código original se não encontrar
        return amountDescription || amountKey;
    };
    

    // Usar o registro da API ou do state
    const record = woundRecord || woundRecordFromState;
    console.log('Record usado:', record);
    
    // Se não tiver dados, mostrar mensagem de erro
    if (!record) {
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
                        {(() => {
                            // Usar track_date se updated_at não estiver disponível
                            const dateStr = record.updated_at || record.track_date;
                            
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
                        {/* Seção da imagem */}
                        {(record.image_id || record.image_url) && (
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
                            {record && record.length && record.width && (
                                <div>
                                    <p className="font-medium text-sm">Tamanho</p>
                                    <div className="flex items-center mt-1">
                                        <div className="flex flex-row items-center bg-blue-50 rounded-md px-2 py-1">
                                            <span className="text-xs text-blue-800 font-medium">{record.length}</span>
                                            <span className="text-xs text-blue-500 mx-1">×</span>
                                            <span className="text-xs text-blue-800 font-medium">{record.width}</span>
                                            <span className="text-xs text-blue-500 ml-1">cm</span>
                                        </div>
                                        <span className="text-xs text-blue-400 ml-2">
                                            (Área: {(Number(record.length) * Number(record.width)).toFixed(2)} cm²)
                                        </span>
                                    </div>
                                </div>
                            )}

                            {record && record.pain_level !== undefined && (
                                <div>
                                    <p className="font-medium text-sm">Nível da dor</p>
                                    <p className="text-xs">{record.pain_level}/10</p>
                                </div>
                            )}

                            {record && record.exudate_type !== undefined && (
                                <div>
                                    <p className="font-medium text-sm">Cor do pus</p>
                                    <p className="text-xs">
                                        {getExudateTypeDescription(record.exudate_type)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <hr className="border-t border-gray-200 my-4" />

                        {/* Informações complementares */}
                        <h2 className="text-lg font-bold text-blue-800 mb-4">Informações complementares</h2>

                        <div className="space-y-4 text-blue-800 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                {record && record.had_a_fever !== undefined && (
                                    <div>
                                        <p className="font-medium text-sm">Febre nas últimas 24h</p>
                                        <p className="text-xs">{record.had_a_fever ? "Sim" : "Não"}</p>
                                    </div>
                                )}

                                {record && record.dressing_changes_per_day && (
                                    <div>
                                        <p className="font-medium text-sm">Trocas de curativo por dia</p>
                                        <p className="text-xs">{getExudateAmountDescription(record.dressing_changes_per_day)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Observações adicionais */}
                        {record.extra_notes && (
                            <>
                                <hr className="border-t border-gray-200 my-4" />
                                <h2 className="text-lg font-bold text-blue-800 mb-4">Relato ao especialista</h2>

                                <div className="space-y-4 text-blue-800">
                                    <div>
                                        <p className="text-xs">{record.extra_notes}</p>
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

