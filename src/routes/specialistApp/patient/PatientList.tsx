// filepath: /Users/gustavom/Documents/unicamp/app-wounds/src/routes/specialistApp/patient/PatientList.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react"
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest } from "@/data/common/HttpExtensions.ts";
import type { Patient } from "@/data/common/Mapper.ts";
import { formatPatientBirthday } from "@/data/common/Mapper.ts";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground.tsx";
import { SearchBar } from "@/components/shared/SearchBar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ProfessionalIcon } from "@/components/ui/new/ProfessionalIcon";
import CategoryCard from "@/components/ui/new/card/CategoryCard";
import { 
    Drawer, 
    DrawerContent, 
    DrawerHeader, 
    DrawerTitle, 
    DrawerClose,
    DrawerFooter
} from "@/components/ui/drawer";

// Helper function to get initials from a name
const getInitials = (name: string): string => {
    if (!name) return "";
    
    const names = name.trim().split(' ');
    if (names.length === 0) return "";
    if (names.length === 1 && names[0]) {
        return names[0].charAt(0).toUpperCase();
    }
    
    // Get first letter of first name and first letter of last name
    const firstInitial = names[0]?.charAt(0) || '';
    const lastInitial = names[names.length - 1]?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
};

// Interface for filters
interface PatientFilters {
    gender: string | null;
}

export default function PatientsPage() {
    const navigate = useNavigate();
    // Get specialist info from localStorage
    const [specialistId, setSpecialistId] = useState<string | null>(null);
    
    // Filter states
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState<PatientFilters>({
        gender: null
    });
    
    // Track if filters have been applied
    const [filtersApplied, setFiltersApplied] = useState(false);
    
    useEffect(() => {
        try {
            const specialistData = localStorage.getItem("specialist_data");
            if (specialistData) {
                const parsedData = JSON.parse(specialistData);
                setSpecialistId(parsedData.id);
            } else {
                const userInfo = localStorage.getItem("user_info");
                if (userInfo) {
                    const parsedInfo = JSON.parse(userInfo);
                    setSpecialistId(parsedInfo.id);
                }
            }
        } catch (error) {
            console.error("Error getting specialist info:", error);
        }
    }, []);

    const apiUrl = specialistId 
        ? getBaseURL(`patients/?specialist_id=${specialistId}`) 
        : getBaseURL("patients/");

    const {
        data, trigger, error
    } = useSWRMutation<Patient[]>(apiUrl, getRequest);
    console.log(data, error)

    useEffect(() => {
        if (apiUrl) {
            trigger();
        }
    }, [trigger, apiUrl]);

    const [searchTerm, setSearchTerm] = useState('');
    const patients: Patient[] = formatPatientBirthday(data || []);

    const filteredPatients = patients.filter(patient => {
        // Check if name matches search term
        const nameMatch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Check gender filter
        const genderMatch = !filters.gender || patient.gender === filters.gender;
        
        // Return true only if all active filters are matched
        return nameMatch && genderMatch;
    });
    
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
    
    const handleFilterClick = () => {
        setFilterOpen(true);
    };
    
    const applyFilters = () => {
        setFiltersApplied(!!filters.gender);
        setFilterOpen(false);
    };
    
    const clearFilters = () => {
        setFilters({
            gender: null
        });
        setFiltersApplied(false);
    };

    const handleGenderSelect = (gender: string) => {
        setFilters({
            ...filters,
            gender: gender === "" ? null : gender
        });
    };

    return (
        <WaveBackgroundLayout className="overflow-y-auto">
            <div className="flex flex-col h-full w-full items-center px-4">
                <div className="flex justify-center items-center mt-6 mb-6">
                    <ProfessionalIcon size={0.6} borderRadius="50%" />
                </div>
                
                <div className="w-full mt-6">
                    <SearchBar 
                        placeholder="Pesquise o nome do paciente"
                        value={searchTerm}
                        onChange={handleSearch}
                        height="48px"
                        onFilterClick={handleFilterClick}
                    />
                </div>
                
                {filtersApplied && (
                    <div className="w-full mt-3 flex items-center">
                        <div className="text-sm text-blue-700 font-medium">
                            Filtros aplicados: {filters.gender}
                        </div>
                        <Button 
                            variant="link" 
                            className="text-sm text-blue-700 p-0 ml-2 h-auto" 
                            onClick={clearFilters}
                        >
                            Limpar
                        </Button>
                    </div>
                )}

                <div className="flex flex-col w-full mt-6 pb-16">
                    {filteredPatients.map((patient, index) => (
                        <CategoryCard 
                          title={patient.name}
                          description={<>
                            {patient.gender}<br />
                            {patient.birthday}
                          </>}
                          key={index}
                          icon={<div className="text-[#3357E6] font-semibold text-base">{getInitials(patient.name)}</div>}
                          onClick={() => navigate('/specialist/patient/wounds', {state: {patient_id: patient.patient_id}})}
                        />
                    ))}
                    
                    {filteredPatients.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum paciente encontrado
                        </div>
                    )}
                </div>

                <div className="fixed bottom-4 left-4 right-4">
                    <Button 
                        type="button" 
                        className="w-full bg-[#0F4B8F] hover:bg-[#0D3F7A] text-white rounded-xl py-3"
                        onClick={() => navigate("/specialist/patient/create")}
                    >
                        <Plus className="mr-2 h-5 w-5"/>
                        Adicionar Paciente
                    </Button>
                </div>
            </div>
            
            {/* Filter Drawer */}
            <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
                <DrawerContent>
                    <DrawerHeader className="border-b pb-2">
                        <DrawerTitle className="text-lg font-medium">Filtrar Pacientes</DrawerTitle>
                        <DrawerClose className="absolute right-4 top-4 bg-transparent hover:bg-slate-100 rounded-full p-2">
                            <X className="h-4 w-4" />
                        </DrawerClose>
                    </DrawerHeader>
                    
                    <div className="px-4 py-4">
                        <div className="mb-4">
                            <h4 className="mb-3 font-medium text-lg">Gênero</h4>
                            <div className="flex flex-col space-y-2">
                                <Button 
                                    onClick={() => handleGenderSelect("")}
                                    variant={filters.gender === null ? "default" : "outline"}
                                    className={filters.gender === null ? "bg-blue-700 text-white" : ""}
                                >
                                    Todos
                                </Button>
                                <Button 
                                    onClick={() => handleGenderSelect("Masculino")}
                                    variant={filters.gender === "Masculino" ? "default" : "outline"}
                                    className={filters.gender === "Masculino" ? "bg-blue-700 text-white" : ""}
                                >
                                    Masculino
                                </Button>
                                <Button 
                                    onClick={() => handleGenderSelect("Feminino")}
                                    variant={filters.gender === "Feminino" ? "default" : "outline"}
                                    className={filters.gender === "Feminino" ? "bg-blue-700 text-white" : ""}
                                >
                                    Feminino
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <DrawerFooter className="border-t pt-4">
                        <Button 
                            type="button"
                            variant="outline" 
                            onClick={clearFilters}
                            className="mb-2"
                        >
                            Limpar Filtros
                        </Button>
                        <Button 
                            type="button"
                            className="bg-[#0F4B8F] hover:bg-[#0D3F7A] text-white"
                            onClick={applyFilters}
                        >
                            Aplicar Filtros
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </WaveBackgroundLayout>
    );
};
