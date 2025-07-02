import { Plus, FileDown, AlertTriangle, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import { Card } from "@/components/ui/card.tsx"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Patient, Wound } from "@/data/common/Mapper.ts";
import { calculateAge } from "@/data/common/Mapper.ts";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { useRef, useEffect, useState, useCallback } from "react";
import { LoadingScreen, type LoadingScreenHandle } from '@/components/ui/new/loading/LoadingScreen';
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground.tsx";
import { ProfessionalIcon } from "@/components/ui/new/ProfessionalIcon";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import jsPDF from 'jspdf';
import { getRegionDescription, getSubregionDescription, getWoundType } from "@/data/common/LocalDataMapper.tsx";


const customGetRequest = async (url: string) => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        throw new Error("Authentication token not found");
    }
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        mode: 'cors'
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
};

// Define a custom DELETE request function
const customDeleteRequest = async (url: string) => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        throw new Error("Authentication token not found");
    }
    
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        mode: 'cors'
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return true; // Return true for successful deletion
};


const PatientInfoCard = ({ title, content, onEdit, onSave }: { 
    title: string; 
    content: string; 
    onEdit?: () => void;
    onSave?: (newContent: string) => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else {
            setIsEditing(true);
            setEditContent(content);
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave(editContent);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditContent(content);
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#0120AC] text-lg font-semibold">{title}</h3>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button 
                            variant="link" 
                            onClick={handleCancel} 
                            className="text-gray-500 p-0 h-auto text-sm font-medium"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="link" 
                            onClick={handleSave} 
                            className="text-[#0120AC] p-0 h-auto text-sm font-medium"
                        >
                            Salvar
                        </Button>
                    </div>
                ) : (
                    <Button 
                        variant="link" 
                        onClick={handleEdit} 
                        className="text-[#0120AC] p-0 h-auto text-sm font-medium"
                    >
                        Editar
                    </Button>
                )}
            </div>
            <div className="min-h-[120px]">
                {isEditing ? (
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded text-gray-600 text-sm h-[120px] resize-none"
                    />
                ) : (
                    <p className="text-gray-600 text-sm">{content}</p>
                )}
            </div>
        </div>
    );
};

// Info Item component for the details section
const InfoItem = ({ label, value }: { label: string; value: string | number }) => {
    return (
        <div className="mb-6">
            <h4 className="text-[#0120AC] font-semibold mb-2 text-sm">{label}</h4>
            <p className="text-[#0120AC] text-sm">{value}</p>
        </div>
    );
};

const WoundCard = ({wound, index, onDelete}: { 
    wound: Wound; 
    index: number;
    onDelete: (wound_id: number) => Promise<void>;
}) => {
    const navigate = useNavigate();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
        navigate('/specialist/wound/detail', {state: {wound_id: wound.wound_id}});
    };
    
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate('/specialist/wound/detail', {state: {wound_id: wound.wound_id}});
    };
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(wound.wound_id);
        } catch (error) {
            console.error('Error deleting wound:', error);
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
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
                            <span className="text-xs text-blue-600">{getWoundType(wound.type || '')}</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-xs text-blue-800 font-medium mr-1">Local:</span>
                            <span className="text-xs text-blue-600">{getRegionDescription(wound.region)}</span>
                        </div>
                        {wound.subregion && (
                            <div className="flex items-start">
                                <span className="text-xs text-blue-800 font-medium mr-1">Subregião:</span>
                                <span className="text-xs text-blue-600">{getSubregionDescription(wound.region || '', wound.subregion || '')}</span>
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
                        onClick={handleDelete}
                        className="py-1 px-6 text-xs text-blue-800 font-normal rounded-full border border-blue-800 hover:bg-gray-50"
                        disabled={isDeleting}
                    >
                        Excluir
                    </button>
                    <button 
                        onClick={handleEdit}
                        className="py-1 px-6 text-xs bg-blue-800 text-white font-normal rounded-full"
                    >
                        Editar
                    </button>
                </div>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                            Confirmar exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir esta ferida? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default function PatientsWounds() {
    const navigate = useNavigate();
    const location = useLocation();
    const loadingRef = useRef<LoadingScreenHandle>(null);
    const [error, setError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
    
    // Handle missing patient_id
    const patient_id = location.state?.patient_id as number;
    
    useEffect(() => {
        if (!patient_id) {
            setError("ID do paciente não encontrado");
            return;
        }
        
        // Show loading screen on mount
        loadingRef.current?.show();
    }, [patient_id]);

    // Add mutate for SWR to refresh the data after deletion
    const {
        data: _wounds, 
        isLoading: isLoadingWounds, 
        error: woundError,
        mutate: mutateWounds
    } = useSWR<Wound[]>(
        patient_id ? `${import.meta.env.VITE_SERVER_URL}/wounds?patient_id=${patient_id}` : null,
        customGetRequest,
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

    const {
        data: patient, isLoading: isLoadingPatient, error: patientError
    } = useSWR<Patient>(
        patient_id ? `${import.meta.env.VITE_SERVER_URL}/patients/${patient_id}` : null,
        customGetRequest,
        {
            onError: (error) => {
                console.error("Error fetching patient data:", error);
                setError("Erro ao carregar dados do paciente");
            }
        }
    );


    useEffect(() => {
        if (!isLoadingWounds && !isLoadingPatient) {
            const timer = setTimeout(() => {
                loadingRef.current?.hide();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isLoadingWounds, isLoadingPatient]);

    useEffect(() => {
        if (woundError || patientError) {
            loadingRef.current?.hide();
        }
    }, [woundError, patientError]);

    const wounds = _wounds || [];
    

    const [patientDescription, setPatientDescription] = useState(
        "Lorem ipsum odor amet, consectetuer adipiscing elit. Mattis penatibus consectetur justo porta diam molestie. Diam tristique ante aenean maximus nisi."
    );
    
    const savePatientDescription = (newDescription: string) => {
        setPatientDescription(newDescription);
        // If you have an API endpoint to save this data, make the request here:
        // Example:
        // loadingRef.current?.show();
        // try {
        //   const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/patients/${patient_id}`, {
        //     method: 'PATCH',
        //     headers: {
        //       'Content-Type': 'application/json',
        //       'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        //     },
        //     body: JSON.stringify({ description: newDescription })
        //   });
        //
        //   if (!response.ok) throw new Error('Failed to update');
        //   
        //   setDeleteSuccess("Informações atualizadas com sucesso!");
        //   setTimeout(() => setDeleteSuccess(null), 3000);
        // } catch (error) {
        //   console.error('Error updating patient:', error);
        //   setError("Erro ao atualizar informações do paciente.");
        //   setTimeout(() => setError(null), 3000);
        // } finally {
        //   loadingRef.current?.hide();
        // }
    };

    // Extract patient information safely
    const patientName = patient?.name || "Carregando...";
    const patientAge = patient?.birthday ? calculateAge(new Date(patient.birthday)) : "N/A";
    
    // Add state for comorbidities lookup table
    const [comorbidities, setComorbidities] = useState<Record<number, string>>({});
    
    // Fetch comorbidities data on component initialization
    const fetchComorbidities = useCallback(async () => {
        try {
            const response = await customGetRequest(`${import.meta.env.VITE_SERVER_URL}/comorbidities`);
            
            // Create a lookup object mapping comorbididade_id to name
            const comorbiditiesMap: Record<number, string> = {};
            response.forEach((item: { comorbidity_id: number; name: string }) => {
                comorbiditiesMap[item.comorbidity_id] = item.name;
            });
            
            setComorbidities(comorbiditiesMap);
        } catch (error) {
            console.error("Error fetching comorbidities:", error);
        }
    }, []);
    
    // Call the fetch function on component mount
    useEffect(() => {
        fetchComorbidities();
    }, [fetchComorbidities]);
    
    // Format comorbidities properly by mapping IDs to names
    const formatComorbidities = useCallback(() => {
        if (!patient?.comorbidities || !Array.isArray(patient.comorbidities) || patient.comorbidities.length === 0) {
            return "Sem comorbidades";
        }
        
        // Map each comorbididade ID to its name using the lookup table
        const comorbidityNames = patient.comorbidities
            .map(id => comorbidities[id] || `Comorbidade ${id}`)
            .filter(Boolean);
        
        if (comorbidityNames.length === 0) {
            return "Sem comorbidades";
        }
        
        return comorbidityNames.join(", ");
    }, [patient?.comorbidities, comorbidities]);
    
    // Replace the existing patientComorbidity declaration with this:
    const patientComorbidity = formatComorbidities();
    
    // Format habits by combining smoking and drinking information
    const formatHabits = () => {
        const smokingInfo = patient?.smoke_frequency ? `Tabagismo: ${patient.smoke_frequency}` : "Não fuma";
        const drinkingInfo = patient?.drink_frequency ? `Etilismo: ${patient.drink_frequency}` : "Não bebe";
        
        return `${smokingInfo}, ${drinkingInfo}`;
    };

    const patientHabits = patient ? formatHabits() : "Não informado";

    // Add this function to the PatientWounds component
    const generatePDF = async () => {
        if (!patient) return;
        
        loadingRef.current?.show();
        
        try {
            // Create a new PDF document
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            
            // Add a title
            pdf.setFontSize(20);
            pdf.setTextColor(1, 32, 172); // #0120AC in RGB
            pdf.text(`Paciente: ${patientName}`, pageWidth / 2, 20, { align: 'center' });
            
            // Add patient information section
            pdf.setFontSize(16);
            pdf.text('Sobre o paciente', 20, 40);
            
            pdf.setFontSize(12);
            pdf.setTextColor(80, 80, 80); // Dark gray for regular text
            
            const description = patientDescription;
            const splitDescription = pdf.splitTextToSize(description, pageWidth - 40);
            pdf.text(splitDescription, 20, 50);
            
            // Add a line separator
            pdf.setDrawColor(200, 200, 200); // Light gray line
            pdf.line(20, 70, pageWidth - 20, 70);
            
            // Add patient details (age, comorbidity, habits)
            pdf.setTextColor(1, 32, 172);
            pdf.setFontSize(14);
            pdf.text('Idade', 20, 85);
            
            pdf.setFontSize(12);
            pdf.text(patientAge.toString(), 20, 95);
            
            pdf.setFontSize(14);
            pdf.text('Comorbidade', 20, 110);
            
            pdf.setFontSize(12);
            const splitComorbidity = pdf.splitTextToSize(patientComorbidity, pageWidth - 40);
            pdf.text(splitComorbidity, 20, 120);
            
            pdf.setFontSize(14);
            pdf.text('Hábitos', 20, 140);
            
            pdf.setFontSize(12);
            const splitHabits = pdf.splitTextToSize(patientHabits, pageWidth - 40);
            pdf.text(splitHabits, 20, 150);
            
            // Add wound section if there are wounds
            if (wounds.length > 0) {
                pdf.setFontSize(16);
                pdf.text('Feridas', 20, 180);
                
                let yPosition = 190;
                
                // Add each wound
                wounds.forEach((wound, index) => {
                    // Check if we need a new page
                    if (yPosition > 250) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    pdf.setFontSize(14);
                    pdf.text(`Ferida ${index + 1}`, 20, yPosition);
                    yPosition += 10;
                    
                    pdf.setFontSize(12);
                    pdf.text(`Tipo: ${getWoundType(wound.type || '')}`, 25, yPosition);
                    yPosition += 8;
                    
                    pdf.text(`Local: ${getRegionDescription(wound.region)}`, 25, yPosition);
                    yPosition += 8;
                    
                    if (wound.subregion) {
                        pdf.text(`Subregião: ${getSubregionDescription(wound.region || '', wound.subregion || '')}`, 25, yPosition);
                        yPosition += 15;
                    }
                });
            } else {
                pdf.setFontSize(14);
                pdf.text('Nenhuma ferida cadastrada para este paciente.', 20, 180);
            }
            
            // Add a footer with date
            const today = new Date();
            const dateStr = today.toLocaleDateString('pt-BR');
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Relatório gerado em: ${dateStr}`, pageWidth - 20, 287, { align: 'right' });
            
            // Save the PDF
            pdf.save(`Paciente_${patient.name.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('Erro ao gerar o PDF');
        } finally {
            loadingRef.current?.hide();
        }
    };

    // Handle wound deletion
    const handleDeleteWound = async (wound_id: number) => {
        try {
            loadingRef.current?.show();
            
            // Make the DELETE request
            await customDeleteRequest(`${import.meta.env.VITE_SERVER_URL}/wounds/${wound_id}/`);
            
            // Show success message
            setDeleteSuccess("Ferida excluída com sucesso!");
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                setDeleteSuccess(null);
            }, 3000);
            
            // Refresh the wounds data
            await mutateWounds();
            
        } catch (error) {
            console.error("Error deleting wound:", error);
            setError("Erro ao excluir ferida. Tente novamente mais tarde.");
            
            // Remove error message after 3 seconds
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            loadingRef.current?.hide();
        }
    };

    return (
        <>
            {/* Change the WaveBackgroundLayout styling */}
            <WaveBackgroundLayout className="absolute inset-0 overflow-auto">
                <div className="flex flex-col w-full min-h-full items-center px-4">
                    {/* Header with Professional Icon */}
                    <div className="flex justify-center items-center mt-6 mb-6">
                        <ProfessionalIcon size={0.6} borderRadius="50%" />
                    </div>

                    {/* PageHeader component */}
                    <div className="flex w-full items-center justify-between mb-4">
                        <PageTitleWithBackButton 
                            title={patientName} 
                            backPath="/specialist/patient/list"
                            className="mb-0 mt-0 flex-1"
                        />
                        {/* Remove the PDF button from here */}
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="w-full bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Success message */}
                    {deleteSuccess && (
                        <div className="w-full bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                            <p className="text-green-600">{deleteSuccess}</p>
                        </div>
                    )}

                    {/* Patient Info section based on the image */}
                    {!isLoadingPatient && patient && (
                        <div id="patient-info-section">
                            {/* "Sobre o paciente" card as shown in the image */}
                            <PatientInfoCard 
                                title="Sobre o paciente" 
                                content={patientDescription} 
                                onSave={savePatientDescription}
                            />
                            
                            {/* Patient details section - UPDATED with lighter divider */}
                            <div className="w-full border-t border-gray-200 pt-6 mb-6">
                                <InfoItem 
                                    label="Idade" 
                                    value={patientAge}
                                />
                                
                                <InfoItem 
                                    label="Comorbidade" 
                                    value={patientComorbidity}
                                />
                                
                                <InfoItem 
                                    label="Hábitos" 
                                    value={patientHabits}
                                />
                            </div>
                            
                            {/* QR Code button centered below patient info */}
                            <div className="flex justify-center w-full mb-6">
                                <button
                                    onClick={() => {
                                        navigate('/specialist/patient/create/qrcode', { state: { patient_id: patient_id } });
                                    }}
                                    className="py-2 px-8 text-sm text-blue-800 font-medium rounded-full border border-blue-800 hover:bg-gray-50 flex items-center gap-2"
                                    disabled={!patient_id}
                                >
                                    <QrCode className="h-4 w-4" />
                                    Gerar QR Code
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Wounds section - updated to pass onDelete handler */}
                    
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
                                    onDelete={handleDeleteWound}
                                />
                            ))
                        )}
                    </div>
                    
                    {/* Update the button area to be centered */}
                    <div className="flex justify-center gap-2 w-full mt-4 mb-8">
                        <button
                            onClick={generatePDF}
                            className="py-1 px-6 text-xs text-blue-800 font-normal rounded-full border border-blue-800 hover:bg-gray-50 flex items-center gap-1"
                            disabled={isLoadingPatient || !patient}
                        >
                            <FileDown className="h-3.5 w-3.5" />
                            Exportar PDF
                        </button>
                        <Button 
                            type="button" 
                            className="py-1 px-6 text-xs bg-blue-800 text-white font-normal rounded-full flex items-center gap-1" 
                            onClick={() => {
                                navigate('/specialist/wound/create', {state: {patient_id: patient_id}});
                            }}
                            disabled={!patient_id}
                        >
                            <Plus className="h-3.5 w-3.5"/>
                            Adicionar Ferida
                        </Button>
                    </div>
                </div>
            </WaveBackgroundLayout>
            
            <LoadingScreen ref={loadingRef} />
        </>
    );
}