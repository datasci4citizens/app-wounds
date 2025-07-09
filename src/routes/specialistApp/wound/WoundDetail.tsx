import tissueTypeData from '@/localdata/tissue-type.json';
import exudateTypeData from '@/localdata/exudate-type.json';
import exudateAmountData from '@/localdata/exudate-amount.json';
import { Button } from "@/components/ui/button.tsx"
import { ChevronsDownUp, ChevronsUpDown, PenLine } from "lucide-react"
import { useEffect, useState, type Key } from "react";
import useSWRMutation from "swr/mutation";
import { useLocation, useNavigate } from "react-router-dom";
import type { WoundRecord } from "@/data/common/Mapper.ts";
import { format, parseISO } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.tsx";
import { getRegionDescription, getSubregionDescription, getWoundType } from "@/data/common/LocalDataMapper.tsx";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import { ProfessionalIcon } from "@/components/ui/new/ProfessionalIcon";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";


const WoundRecordCollapsable = ({woundRecord, woundId}: { woundRecord: WoundRecord, woundId: number }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    

    const formattedDate = (() => {
        // Usar track_date se disponível
        const dateStr = woundRecord.track_date;
        
        if (!dateStr) return "Data não disponível";
        
        try {
            // Extrair apenas a data (dia/mês/ano) sem a hora
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(5, 7);
            const day = dateStr.substring(8, 10);
            
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dateStr; // Retorna a string original em caso de erro
        }
    })();

    // Função para buscar a imagem da ferida
    useEffect(() => {
        // Só buscar a imagem se o card estiver aberto e tiver um image_id
        if (!isOpen || !woundRecord.image_id) {
            return;
        }
        
        const fetchTrackingImage = async () => {
            setImageLoading(true);
            setImageError(false);
            
            try {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    throw new Error('Token de acesso não encontrado');
                }
                
                // 1. Primeiro buscar os metadados da imagem
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/images/${woundRecord.image_id}`, {
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
                
                if (!imageData.image) {
                    throw new Error('URL da imagem não encontrada na resposta');
                }
                
                // 3. Carregar a imagem real da URL fornecida
                const imageResponse = await fetch(imageData.image);
                if (!imageResponse.ok) {
                    throw new Error(`Erro ao carregar imagem da URL: ${imageResponse.status}`);
                }
                
                // 4. Criar um blob e URL para mostrar a imagem
                const imageBlob = await imageResponse.blob();
                const url = URL.createObjectURL(imageBlob);
                setImageUrl(url);
                
            } catch (error) {
                console.error('Erro ao carregar imagem do tracking record:', error);
                setImageError(true);
            } finally {
                setImageLoading(false);
            }
        };
        
        fetchTrackingImage();
        
        // Limpar URL criado quando o componente for desmontado ou o card for fechado
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
                setImageUrl(null);
            }
        };
    }, [isOpen, woundRecord.image_id]);

    const handleSeeMoreButtonClick = () => {
        // Usar tracking_id ou tracking_record_id, o que estiver disponível
        const trackingRecordId = woundRecord.tracking_id || woundRecord.tracking_record_id;
        
        navigate('/specialist/wound/record-detail', {
            state: {
                wound_id: woundId,
                tracking_record_id: trackingRecordId,
                woundRecord: woundRecord
            }
        });
    };

    // Função para obter descrição do tipo de exsudato atualizada para usar o JSON
    const getExudateTypeDescription = (type: string | number) => {
        if (type === undefined || type === null) return '';
        
        // Converter para string para garantir que funcione com números
        const typeKey = String(type);
        
        // Acessa diretamente o tipo de exsudato do JSON importado
        const exudateDescription = (exudateTypeData as Record<string, string>)[typeKey];
        
        // Retorna a descrição ou o código original se não encontrar
        return exudateDescription || typeKey;
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

    // Função para obter descrição do nível de dor
    const getPainLevelDescription = (level: string | number) => {
        return `${level}/10`;
    };
    
    // Função para obter o tipo de tecido direto do JSON
    const getTissueTypeDescription = (code: string | number) => {
        if (code === undefined || code === null) return '';
        
        // Converter para string para garantir que funcione com números
        const codeKey = String(code);
        
        // Acessa diretamente o tipo de tecido do JSON importado
        const tissueInfo = (tissueTypeData as Record<string, {type: string, description: string}>)[codeKey];
        
        // Retorna o tipo de tecido ou o código original se não encontrar
        return tissueInfo?.type || codeKey;
    };

    return (
        <div className="mb-4">
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full overflow-hidden border border-blue-100 rounded-xl"
            >
                <CollapsibleTrigger className="w-full">
                    <div className="flex justify-between items-center p-4 text-blue-800 bg-white">
                        <p className="text-xs font-medium">{formattedDate}</p>
                        {isOpen ? 
                            <div className="text-blue-800"><ChevronsDownUp className="h-6 w-6" /></div> : 
                            <div className="text-blue-800"><ChevronsUpDown className="h-6 w-6" /></div>
                        }
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="p-4 border-t border-blue-100">
                        {woundRecord.image_id && (
                            <div className="mb-4">
                                <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden rounded-md">
                                    {imageLoading ? (
                                        // Indicador de carregamento
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            <p className="text-xs text-gray-500 mt-2">Carregando imagem...</p>
                                        </div>
                                    ) : imageUrl && !imageError ? (
                                        // Imagem carregada com sucesso
                                        <img
                                            src={imageUrl}
                                            alt={`Imagem do acompanhamento de ${formattedDate}`}
                                            className="w-full h-full object-contain"
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        // Placeholder ou erro
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 mb-2"> 
                                                <div className="w-0 h-0 mx-auto
                                                    border-l-[18px] border-l-transparent
                                                    border-b-[30px] border-b-gray-400
                                                    border-r-[18px] border-r-transparent">
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-center space-x-8">
                                                <div className="w-9 h-9 bg-gray-400"></div>
                                                <div className="w-9 h-9 bg-gray-400 rounded-full"></div>
                                            </div>
                                            
                                            {imageError && (
                                                <p className="text-xs text-red-500 mt-2">Erro ao carregar imagem</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="text-blue-800 space-y-4">
                            <div>
                                <p className="text-xs font-medium">Tamanho</p>
                                <div className="flex items-center mt-1">
                                    <div className="flex flex-row items-center bg-blue-50 rounded-md px-2 py-1">
                                        <span className="text-xs text-blue-800 font-medium">{woundRecord.length}</span>
                                        <span className="text-xs text-blue-500 mx-1">×</span>
                                        <span className="text-xs text-blue-800 font-medium">{woundRecord.width}</span>
                                        <span className="text-xs text-blue-500 ml-1">cm</span>
                                    </div>
                                    <span className="text-xs text-blue-400 ml-2">(comprimento × largura)</span>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-xs font-medium">Nível de dor</p>
                                <p className="text-xs">
                                    {getPainLevelDescription(woundRecord.pain_level)}
                                </p>
                            </div>
                            
                            <div>
                                <p className="text-xs font-medium">Tipo de tecido</p>
                                <p className="text-xs">
                                    {getTissueTypeDescription(woundRecord.tissue_type)}
                                </p>
                            </div>
                            
                            <div>
                                <p className="text-xs font-medium">Exsudato</p>
                                <p className="text-xs">
                                    {getExudateTypeDescription(woundRecord.exudate_type)} - {getExudateAmountDescription(woundRecord.exudate_amount)}
                                </p>
                            </div>
                            
                            {woundRecord.extra_notes && (
                                <div>
                                    <p className="text-xs font-medium">Suas Observações</p>
                                    <p className="text-xs">
                                        {woundRecord.extra_notes}
                                    </p>
                                </div>
                            )}
                            
                            <div className="flex justify-end mt-4">
                                <button 
                                    onClick={handleSeeMoreButtonClick}
                                    className="text-blue-800 text-xs font-medium"
                                >
                                    Ver mais
                                </button>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

export default function WoundDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id as number;
    
    const apiUrlTrackingRecords = `${import.meta.env.VITE_SERVER_URL}/tracking-records/?wound_id=${woundId}`;
    const apiUrlWoundDetails = `${import.meta.env.VITE_SERVER_URL}/wounds/${woundId}/`;
    
    const {
        data: trackingRecords,
        error,
        trigger, 
        isMutating
    } = useSWRMutation(
        apiUrlTrackingRecords, 
        async (url) => {
            const token = localStorage.getItem('access_token');
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch tracking records');
            return response.json();
        }
    );

    const {
        data: woundDetails,
        error: woundError,
        trigger: triggerWoundDetails,
        isMutating: isWoundLoading
    } = useSWRMutation(
        apiUrlWoundDetails,
        async (url) => {
            const token = localStorage.getItem('access_token');
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch wound details');
            return response.json();
        }
    );

    useEffect(() => {
        trigger();
        triggerWoundDetails();
    }, [trigger, triggerWoundDetails]);
    
    // Tratamento de erro existente
    if (error || woundError) {
        return <div className="p-6 text-red-500">Erro ao carregar detalhes da ferida. Por favor, tente novamente.</div>;
    }

    // Combinar dados para ter informações completas
    const wound = woundDetails ? {
        ...woundDetails,
        tracking_records: trackingRecords || []
    } : null;

    return (
        <WaveBackgroundLayout className="absolute inset-0 overflow-auto bg-blue-50">
            <div className="flex flex-col w-full min-h-full items-center px-4">
                {/* Header com ícone do profissional */}
                <div className="flex justify-center items-center mt-6 mb-6">
                    <ProfessionalIcon size={0.6} borderRadius="50%" />
                </div>
        
                {/* Título da página com botão voltar */}
                <div className="w-full">
                    <PageTitleWithBackButton 
                        title={"Ferida"} 
                        onBackClick={() => wound && navigate('/specialist/patient/wounds', {state: {patient_id: wound.patient_id}})}
                        className="w-full mb-4"
                    />
                </div>

                {(isMutating || isWoundLoading) ? (
                    <div className="flex justify-center items-center p-8">
                        <p className="text-lg text-gray-600">Carregando detalhes de ferida...</p>
                    </div>
                ) : (
                    wound && (
                        <>
                            {/* Card com nome do paciente */}
                            <div className="flex flex-col w-full max-w-xl bg-white rounded-2xl p-5 shadow-sm mb-2">
                                <div>
                                    <h3 className="text-base font-semibold text-blue-800 mb-0">Paciente</h3>
                                    <p className="text-sm text-blue-800">{localStorage.getItem('currentPatientName') || ""}</p>
                                </div>
                            </div>
                            
                            {/* Div principal com os detalhes da ferida e atualizações */}
                            <div className="flex flex-col w-full max-w-xl bg-white rounded-2xl p-5 shadow-sm mb-6">
                                {/* Informações da ferida */}
                                <div className="relative mb-8">
                                    <div 
                                        className="absolute top-0 right-0 bg-white p-2 rounded-full shadow-sm cursor-pointer"
                                        onClick={() => {
                                            const accessToken = localStorage.getItem('accessToken');
                                            navigate('/specialist/wound/add-update', {
                                                state: {
                                                    wound_id: woundId,
                                                    patient_id: wound.patient_id,
                                                    isEditing: true,
                                                    fromWoundDetail: true,
                                                    woundData: wound,
                                                    accessToken: accessToken
                                                }
                                            });
                                        }}
                                    >
                                        <PenLine className="h-5 w-5 text-blue-800" />
                                    </div>

                                    <div className="space-y-5 mt-2">
                                        
                                        <div>
                                            <h3 className="text-base font-semibold text-blue-800 mb-0">Local da ferida</h3>
                                                <p className="text-sm text-blue-800">{getRegionDescription(wound.region.split(" ")[0])}</p>
                                        </div>
                                        
                                        {wound.region.split(" ")[1] && (
                                            <div>
                                                <h3 className="text-base font-semibold text-blue-800 mb-0">Subregião</h3>
                                                <p className="text-sm text-blue-800">{getSubregionDescription(wound.region.split(" ")[0], wound.region.split(" ")[1])}</p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h3 className="text-base font-semibold text-blue-800 mb-0">Tipo de ferida</h3>
                                            <p className="text-sm text-blue-800">{getWoundType(wound.wound_type)}</p>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-base font-semibold text-blue-800 mb-0">Data de início</h3>
                                            <p className="text-sm text-blue-800">{format(parseISO(wound.start_date), "dd/MM/yyyy")}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Linha divisória adicionada antes do título "Atualizações" */}
                                <hr className="border-t border-gray-200 mt-6 mb-4" />

                                {/* Título "Atualizações" com tamanho reduzido */}
                                <h2 className="text-lg font-bold text-blue-800 mb-4">Atualizações</h2>
                                <h3 className="text-sm  text-blue-800 mb-4">Ordenadas pela mais recente</h3>

                                {/* Lista de atualizações */}
                                <div className="w-full">
                                    {wound.tracking_records && wound.tracking_records.length > 0 ? (
                                        [...wound.tracking_records].reverse().map((woundRecord: WoundRecord, index: Key | null | undefined) => (
                                            <WoundRecordCollapsable key={index} woundRecord={woundRecord} woundId={woundId}/>
                                        ))
                                    ) : (
                                        <div className="flex justify-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-blue-500">Sem atualizações cadastradas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center mt-4 mb-8 w-full max-w-xl">
                                <Button 
                                    type="button" 
                                    className="bg-blue-800 hover:bg-blue-700 rounded-full w-64 py-3 text-base font-medium" 
                                    onClick={() => {
                                        const accessToken = localStorage.getItem('accessToken');
                                        navigate('/specialist/wound/add-update', {
                                            state: {
                                                wound_id: woundId,
                                                patient_id: wound.patient_id,
                                                fromWoundDetail: true,
                                                accessToken: accessToken
                                            }
                                        });
                                    }}
                                >
                                    Nova atualização
                                </Button>
                            </div>
                        </>
                    )
                )}
            </div>
        </WaveBackgroundLayout>
    );
};