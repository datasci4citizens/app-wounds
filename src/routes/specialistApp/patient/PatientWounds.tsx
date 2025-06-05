import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import type { Patient, Wound } from "@/data/common/Mapper.ts";
import { calculateAge } from "@/data/common/Mapper.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { getRegionDescription, getSubregionDescription, getWoundType } from "@/data/common/LocalDataMapper.tsx";
import useSWR from "swr";
import { useRef, useEffect, useState, useCallback } from "react";
import { LoadingScreen, type LoadingScreenHandle } from '@/components/ui/new/loading/LoadingScreen';
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground.tsx";
import { ProfessionalIcon } from "@/components/ui/new/ProfessionalIcon";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";

// Define a custom request function to handle CORS properly and include authentication
const customGetRequest = async (url: string) => {
    // Get the authentication token from localStorage
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
        mode: 'cors'  // Explicitly set mode to cors
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
};

// Patient Info Card component that matches the design in the image
const PatientInfoCard = ({ title, content, onEdit }: { 
    title: string; 
    content: string; 
    onEdit?: () => void;
}) => {
    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#0120AC] text-lg font-semibold">{title}</h3>
                {onEdit && (
                    <Button 
                        variant="link" 
                        onClick={onEdit} 
                        className="text-[#0120AC] p-0 h-auto text-sm font-medium"
                    >
                        Editar
                    </Button>
                )}
            </div>
            <p className="text-gray-600 text-sm">{content}</p>
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

const WoundCard = ({wound, index}: { wound: Wound, index: number }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate('/specialist/wound/detail', {state: {wound_id: wound.wound_id}});
    };

    return (
        <Card className="mb-4 w-full shadow-sm border-b border-gray-200 cursor-pointer" onClick={handleCardClick}>
            <CardContent className="p-4 flex justify-between items-center">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{`Ferida ${index + 1}`}</h3>
                    <div className="space-y-1 text-sm text-gray-500 leading-tight">
                        <p>Tipo de ferida: {getWoundType(wound.wound_type)}</p>
                        <p>Local: {getRegionDescription(wound.wound_region)}</p>
                        <p>Subregião: {getSubregionDescription(wound.wound_region, wound.wound_subregion)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function PatientsWounds() {
    const navigate = useNavigate();
    const location = useLocation();
    const loadingRef = useRef<LoadingScreenHandle>(null);
    const [error, setError] = useState<string | null>(null);
    
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

    const {
        data: _wounds, isLoading: isLoadingWounds, error: woundError
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

    // Handle combined loading states
    useEffect(() => {
        if (!isLoadingWounds && !isLoadingPatient) {
            // Both requests are done, add a small delay for UX
            const timer = setTimeout(() => {
                loadingRef.current?.hide();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isLoadingWounds, isLoadingPatient]);

    // Handle errors
    useEffect(() => {
        if (woundError || patientError) {
            loadingRef.current?.hide();
        }
    }, [woundError, patientError]);

    const wounds = _wounds || [];
    
    const handleEditPatient = () => {
        // Navigate to patient edit page or open edit modal
        navigate('/specialist/patient/edit', {state: {patient_id: patient_id}});
    };

    // Extract patient information safely
    const patientName = patient?.name || "Carregando...";
    const patientAge = patient?.birthday ? calculateAge(new Date(patient.birthday)) : "N/A";
    const patientDescription = 
        "Lorem ipsum odor amet, consectetuer adipiscing elit. Mattis penatibus consectetur justo porta diam molestie. Diam tristique ante aenean maximus nisi.";

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

    return (
        <>
            <WaveBackgroundLayout className="overflow-y-auto bg-[#F9FAFB]">
                <div className="flex flex-col h-full w-full items-center px-4">
                    {/* Header with Professional Icon */}
                    <div className="flex justify-center items-center mt-6 mb-6">
                        <ProfessionalIcon size={0.6} borderRadius="50%" />
                    </div>

                    {/* Replace this section with the shared PageHeader component */}
                    <PageTitleWithBackButton 
                        title={patientName} 
                        backPath="/specialist/patient/list"
                    />

                    {/* Error display */}
                    {error && (
                        <div className="w-full bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Patient Info section based on the image */}
                    {!isLoadingPatient && patient && (
                        <>
                            {/* "Sobre o paciente" card as shown in the image */}
                            <PatientInfoCard 
                                title="Sobre o paciente" 
                                content={patientDescription} 
                                onEdit={handleEditPatient}
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
                        </>
                    )}

                    {/* Wounds section - old style */}
                    <h2 className="text-xl font-semibold text-left w-full mb-4">Feridas</h2>
                    
                    <div className="w-full">
                        {isLoadingWounds ? (
                            <p className="text-center py-8">Carregando feridas...</p>
                        ) : wounds.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Nenhuma ferida cadastrada para este paciente.
                            </div>
                        ) : (
                            wounds.map((wound, index) => (
                                <WoundCard wound={wound} index={index} key={wound.wound_id} />
                            ))
                        )}
                    </div>
                    
                    <Button 
                        type="button" 
                        className="bg-sky-900 mt-6 mb-6" 
                        onClick={() => {
                            navigate('/specialist/wound/create', {state: {patient_id: patient_id}});
                        }}
                        disabled={!patient_id}
                    >
                        <Plus className="mr-2 h-5 w-5"/>
                        Adicionar Ferida
                    </Button>
                </div>
            </WaveBackgroundLayout>
            
            <LoadingScreen ref={loadingRef} />
        </>
    );
}