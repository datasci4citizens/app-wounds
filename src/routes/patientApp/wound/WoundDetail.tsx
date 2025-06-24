import tissueTypeData from '@/localdata/tissue-type.json';
import exudateTypeData from '@/localdata/exudate-type.json';
import exudateAmountData from '@/localdata/exudate-amount.json';
import { Button } from "@/components/ui/button.tsx"
import { ChevronsDownUp, ChevronsUpDown, PenLine } from "lucide-react"
import { useEffect, useState, type Key } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { WoundRecord } from "@/data/common/Mapper.ts";
import { format, parseISO } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.tsx";
import { getRegionDescription, getSubregionDescription, getWoundType } from "@/data/common/LocalDataMapper.tsx";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import { PatientIcon } from "@/components/ui/new/PatientIcon";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";


const WoundRecordCollapsable = ({woundRecord, woundId}: { woundRecord: WoundRecord, woundId: number }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    

    const formattedDate = (() => {
        const updatedAtStr = woundRecord.updated_at;
    
        const year = updatedAtStr.substring(0, 4);
        const month = updatedAtStr.substring(5, 7);
        const day = updatedAtStr.substring(8, 10);
        const hour = updatedAtStr.substring(11, 13);
        const minute = updatedAtStr.substring(14, 16);
        const second = updatedAtStr.substring(17, 19);
        
        return `${day}/${month}/${year} - ${hour}:${minute}:${second}`;
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
        navigate('/patient/wound/record-detail', {
            state: {
                wound_id: woundId,
                tracking_record_id: woundRecord.tracking_record_id,
                woundRecord: woundRecord
            }
        });
    };

    // Função para obter descrição do tipo de exsudato atualizada para usar o JSON
    const getExudateTypeDescription = (type: string) => {
        if (!type) return '';
        
        // Acessa diretamente o tipo de exsudato do JSON importado
        const exudateDescription = (exudateTypeData as Record<string, string>)[type];
        
        // Retorna a descrição ou o código original se não encontrar
        return exudateDescription || type;
    };

    // Função para obter descrição da quantidade de exsudato atualizada para usar o JSON
    const getExudateAmountDescription = (amount: string) => {
        if (!amount) return '';
        
        // Acessa diretamente a quantidade de exsudato do JSON importado
        const amountDescription = (exudateAmountData as Record<string, string>)[amount];
        
        // Retorna a descrição ou o código original se não encontrar
        return amountDescription || amount;
    };

    // Função para obter descrição do nível de dor
    const getPainLevelDescription = (level: string) => {
        return `${level}/10`;
    };
    
    // Função para obter o tipo de tecido direto do JSON
    const getTissueTypeDescription = (code: string) => {
        if (!code) return '';
        
        // Acessa diretamente o tipo de tecido do JSON importado
        const tissueInfo = (tissueTypeData as Record<string, {type: string, description: string}>)[code];
        
        // Retorna o tipo de tecido ou o código original se não encontrar
        return tissueInfo?.type || code;
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
                                    <p className="text-xs font-medium">Observações</p>
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
    const woundId = location.state?.wound_id as number || 1; // Default to 1 if not provided
    
    // Mock data for wound details
    const mockWoundDetails = {
        wound_id: woundId,
        patient_id: 1,
        region: "lower_limb",
        subregion: "foot",
        type: "diabetic_ulcer",
        start_date: "2024-05-15",
        end_date: "",
        image_id: 1
    };
    
    // Mock data for tracking records
    const mockTrackingRecords = [
        {
            tracking_record_id: 1,
            wound_id: woundId,
            specialist_id: 1,
            width: "5", // Changed to string to match WoundRecord type
            length: "3", // Changed to string to match WoundRecord type
            wound_width: "5",
            wound_length: "3",
            exudate_amount: "2",
            exudate_type: "1",
            tissue_type: "tc",
            wound_edges: "in",
            skin_around_the_wound: "in",
            had_a_fever: false,
            pain_level: "3",
            dressing_changes_per_day: "2",
            guidelines_to_patient: "Manter o local limpo e seco",
            extra_notes: "Paciente relatou melhora na dor",
            image_id: 1,
            track_date: "2024-05-20",
            created_at: "2024-05-20T14:30:00Z",
            updated_at: "2024-05-20T14:30:00Z"
        },
        {
            tracking_record_id: 2,
            wound_id: woundId,
            specialist_id: 1,
            width: "4", // Changed to string to match WoundRecord type
            length: "2", // Changed to string to match WoundRecord type
            wound_width: "4",
            wound_length: "2",
            exudate_amount: "1",
            exudate_type: "2",
            tissue_type: "tc",
            wound_edges: "in",
            skin_around_the_wound: "in",
            had_a_fever: false,
            pain_level: "2",
            dressing_changes_per_day: "2",
            guidelines_to_patient: "Continuar com os cuidados recomendados",
            extra_notes: "Ferida apresenta sinais de cicatrização",
            image_id: 2,
            track_date: "2024-05-27",
            created_at: "2024-05-27T10:15:00Z",
            updated_at: "2024-05-27T10:15:00Z"
        }
    ] as WoundRecord[];
    
    // Simulate loading state
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // Simulate API loading delay
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);
    
    // Combine mock data
    const wound = {
        ...mockWoundDetails,
        tracking_records: mockTrackingRecords
    };

    return (
        <WaveBackgroundLayout className="absolute inset-0 overflow-auto bg-blue-50">
            <div className="flex flex-col w-full min-h-full items-center px-4">
                {/* Header com ícone do paciente */}
                <div className="flex justify-center items-center mt-6 mb-6">
                    <PatientIcon size={0.6} borderRadius="50%" />
                </div>
        
                {/* Título da página com botão voltar */}
                <PageTitleWithBackButton 
                    title={"Ferida"} 
                    onBackClick={() => wound && navigate('/patient/wounds', {state: {patient_id: wound.patient_id}})}
                    className="w-full mb-4"
                />

                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <p className="text-lg text-gray-600">Carregando detalhes de ferida...</p>
                    </div>
                ) : (
                    wound && (
                        <>
                            {/* Div principal com os detalhes da ferida e atualizações */}
                            <div className="flex flex-col w-full max-w-xl bg-white rounded-2xl p-5 shadow-sm mb-6">
                                {/* Informações da ferida */}
                                <div className="relative mb-8">
                                    <div 
                                        className="absolute top-0 right-0 bg-white p-2 rounded-full shadow-sm cursor-pointer"
                                        onClick={() => {
                                            navigate('/patient/wound/add-update/image', {
                                                state: {
                                                    wound_id: woundId,
                                                    patient_id: wound.patient_id
                                                }
                                            });
                                        }}
                                    >
                                        <PenLine className="h-5 w-5 text-blue-800" />
                                    </div>

                                    <div className="space-y-5 mt-2">
                                        <div>
                                            <h3 className="text-base font-semibold text-blue-800 mb-0">Local da ferida</h3>
                                            <p className="text-sm text-blue-800">{getRegionDescription(wound.region)}</p>
                                        </div>
                                        
                                        {wound.subregion && (
                                            <div>
                                                <h3 className="text-base font-semibold text-blue-800 mb-0">Subregião</h3>
                                                <p className="text-sm text-blue-800">{getSubregionDescription(wound.region, wound.subregion)}</p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h3 className="text-base font-semibold text-blue-800 mb-0">Tipo de ferida</h3>
                                            <p className="text-sm text-blue-800">{getWoundType(wound.type)}</p>
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

                                {/* Lista de atualizações */}
                                <div className="w-full">
                                    {wound.tracking_records && wound.tracking_records.length > 0 ? (
                                        wound.tracking_records.map((woundRecord: WoundRecord, index: Key | null | undefined) => (
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
                                        navigate('/patient/wound/add-update/image', {
                                            state: {
                                                wound_id: woundId,
                                                patient_id: wound.patient_id
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