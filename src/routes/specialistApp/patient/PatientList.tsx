import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ArrowDownAZ, Calendar, ClockIcon } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LoadingScreen, type LoadingScreenHandle } from '@/components/ui/new/loading/LoadingScreen';
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";

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

// Helper function to safely format dates
const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    try {
        return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

// Interface for filters
interface PatientFilters {
    gender: string | null;
}

// Sort options for patients
type SortOption = 'name' | 'created_at' | 'updated_at';

export default function PatientsPage() {
    const navigate = useNavigate();
    const loadingRef = useRef<LoadingScreenHandle>(null);
    // Get specialist info from localStorage
    const [specialistId, setSpecialistId] = useState<string | null>(null);
    
    // Filter states
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState<PatientFilters>({
        gender: null
    });
    
    // Sort state
    const [sortOption, setSortOption] = useState<SortOption>('name');
    const [sortOpen, setSortOpen] = useState(false);
    
    // Track if filters have been applied
    const [filtersApplied, setFiltersApplied] = useState(false);
    
    useEffect(() => {
        // Show loading screen immediately when component mounts
        loadingRef.current?.show();
        
        try {
            const specialistData = localStorage.getItem("specialist_data");
            if (specialistData) {
                const parsedData = JSON.parse(specialistData);
                setSpecialistId(parsedData.specialist_id);
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
        data, trigger, isMutating
    } = useSWRMutation<Patient[]>(apiUrl, getRequest);
    
    useEffect(() => {
        if (apiUrl) {
            loadingRef.current?.show();
            
            const startTime = Date.now();
            const minimumLoadingTime = 500;
            
            trigger()
                .then(() => {

                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
                    
                    if (remainingTime > 0) {
                        setTimeout(() => {
                            loadingRef.current?.hide();
                        }, remainingTime);
                    } else {
                        loadingRef.current?.hide();
                    }
                })
                .catch((error) => {
                    console.error("Error fetching patients:", error);
                    
                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
                    
                    if (remainingTime > 0) {
                        setTimeout(() => {
                            loadingRef.current?.hide();
                        }, remainingTime);
                    } else {
                        loadingRef.current?.hide();
                    }
                });
        }
    }, [trigger, apiUrl]);

    useEffect(() => {
        if (isMutating && data) {
            loadingRef.current?.show();
        }
        
    }, [isMutating]);

    const [searchTerm, setSearchTerm] = useState('');
    const patients: Patient[] = formatPatientBirthday(data || []);

    const filteredAndSortedPatients = patients
        .filter(patient => {
            // Check if name matches search term
            const nameMatch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Check gender filter
            const genderMatch = !filters.gender || patient.gender === filters.gender;
            
            // Return true only if all active filters are matched
            return nameMatch && genderMatch;
        })
        .sort((a, b) => {
            // Sort based on selected option
            switch (sortOption) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'created_at':
                    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
                case 'updated_at':
                    return new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime();
                default:
                    return 0;
            }
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
    
    const handleSortClick = () => {
        setSortOpen(true);
    };
    
    const applySort = (option: SortOption) => {
        setSortOption(option);
        setSortOpen(false);
    };

    return (
        <>
            <WaveBackgroundLayout className="overflow-y-auto">
                <div className="flex flex-col h-full w-full items-center px-4">
                    <div className="flex justify-center items-center mt-6">
                        <ProfessionalIcon size={0.6} borderRadius="50%" />
                    </div>

                    <PageTitleWithBackButton 
                        title={"Pacientes"} 
                        backPath="/specialist/menu"
                    />
                    
                    
                    <div className="w-full mt-6">
                        <SearchBar 
                            placeholder="Pesquise o nome do paciente"
                            value={searchTerm}
                            onChange={handleSearch}
                            height="48px"
                            onFilterClick={handleFilterClick}
                        />
                    </div>
                    
                    <div className="w-full mt-3 flex flex-wrap items-center justify-between">
                        {filtersApplied && (
                            <div className="flex items-center">
                                <div className="text-xs text-blue-700 font-medium">
                                    Filtros aplicados: {filters.gender}
                                </div>
                                <Button 
                                    variant="link" 
                                    className="text-xs text-blue-700 p-0 ml-2 h-auto" 
                                    onClick={clearFilters}
                                >
                                    Limpar
                                </Button>
                            </div>
                        )}
                        
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs flex items-center gap-1 h-8 mt-2"
                            onClick={handleSortClick}
                        >
                            {sortOption === 'name' && <ArrowDownAZ className="h-3.5 w-3.5" />}
                            {sortOption === 'created_at' && <Calendar className="h-3.5 w-3.5" />}
                            {sortOption === 'updated_at' && <ClockIcon className="h-3.5 w-3.5" />}
                            {sortOption === 'name' && 'Ordenar por Nome'}
                            {sortOption === 'created_at' && 'Ordenar por Data de criação'}
                            {sortOption === 'updated_at' && 'Ordenar por Data de modificação'}
                        </Button>
                    </div>

                    <div className="flex flex-col w-full mt-6 pb-16">
                        {filteredAndSortedPatients.map((patient, index) => (
                            <CategoryCard 
                              title={patient.name}
                              description={<>
                                {patient.gender == "male" ? "Masculino" : "Feminino"}<br />
                                {patient.birthday}
                                {sortOption !== 'name' && (
                                    <>
                                        <br />
                                        {sortOption === 'created_at' && (
                                            <span className="text-xs text-gray-500">Criado em: {formatDate(patient.created_at)}</span>
                                        )}
                                        {sortOption === 'updated_at' && (
                                            <span className="text-xs text-gray-500">Modificado em: {formatDate(patient.updated_at)}</span>
                                        )}
                                    </>
                                )}
                              </>}
                              key={index}
                              icon={<div className="text-[#3357E6] font-semibold text-base">{getInitials(patient.name)}</div>}
                              onClick={() => {
                                // Salvar o nome do paciente no localStorage
                                localStorage.setItem('currentPatientName', patient.name);
                                // Use React Router navigation with state to pass patient_id
                                navigate('/specialist/patient/wounds', { 
                                  state: { patient_id: patient.patient_id } 
                                });
                              }}
                            />
                        ))}
                        
                        {filteredAndSortedPatients.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Nenhum paciente encontrado
                            </div>
                        )}
                    </div>

                    <div className="fixed bottom-4 left-4 right-4 px-4">
                        <Button 
                            type="button" 
                            className="w-full bg-[#A6BBFF] hover:bg-[#0D3F7A] text-[#3357E6] rounded-xl py-3"
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
                        <DrawerHeader className="border-b pb-2 pt-4">
                            <DrawerTitle className="text-xl font-medium text-center">Filtrar Pacientes</DrawerTitle>
                            <DrawerClose className="absolute right-4 top-4 bg-transparent hover:bg-slate-100 rounded-full p-2">
                                <X className="h-4 w-4" />
                            </DrawerClose>
                        </DrawerHeader>
                        
                        <div className="px-4 py-4">
                            <div className="mb-6">
                                <h3 className="mb-3 text-sm font-medium">Gênero</h3>
                                <RadioGroup 
                                    value={filters.gender === null ? "" : filters.gender}
                                    onValueChange={(value) => setFilters({...filters, gender: value === "" ? null : value})}
                                    className="flex justify-center space-x-6"
                                >
                                    <div className="flex items-center">
                                        <RadioGroupItem value="" id="gender-all" className="mr-2" />
                                        <Label htmlFor="gender-all" className="text-sm font-normal cursor-pointer">
                                            Todos
                                        </Label>
                                    </div>
                                    <div className="flex items-center">
                                        <RadioGroupItem value="male" id="gender-male" className="mr-2" />
                                        <Label htmlFor="gender-male" className="text-sm font-normal cursor-pointer">
                                            Masculino
                                        </Label>
                                    </div>
                                    <div className="flex items-center">
                                        <RadioGroupItem value="female" id="gender-female" className="mr-2" />
                                        <Label htmlFor="gender-female" className="text-sm font-normal cursor-pointer">
                                            Feminino
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        
                        <DrawerFooter className="border-t pt-4">
                            <div className="flex gap-2 w-full">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={clearFilters}
                                    className="flex-1 rounded-lg py-3 text-base"
                                >
                                    Limpar
                                </Button>
                                <Button 
                                    type="button"
                                    className="flex-1 bg-[#0F4B8F] hover:bg-[#0D3F7A] text-white rounded-lg py-3 text-base"
                                    onClick={applyFilters}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
                
                {/* Sort Drawer */}
                <Drawer open={sortOpen} onOpenChange={setSortOpen}>
                    <DrawerContent>
                        <DrawerHeader className="border-b pb-2 pt-4">
                            <DrawerTitle className="text-xl font-medium text-center">Ordenar Pacientes</DrawerTitle>
                            <DrawerClose className="absolute right-4 top-4 bg-transparent hover:bg-slate-100 rounded-full p-2">
                                <X className="h-4 w-4" />
                            </DrawerClose>
                        </DrawerHeader>
                        
                        <div className="px-4 py-4">
                            <div className="space-y-4">
                                <Button 
                                    variant={sortOption === 'name' ? 'default' : 'outline'}
                                    onClick={() => applySort('name')}
                                    className="w-full flex justify-start gap-2 mb-2"
                                >
                                    <ArrowDownAZ className="h-4 w-4" />
                                    Nome
                                </Button>
                                <Button 
                                    variant={sortOption === 'created_at' ? 'default' : 'outline'}
                                    onClick={() => applySort('created_at')}
                                    className="w-full flex justify-start gap-2 mb-2"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Data de criação
                                </Button>
                                <Button 
                                    variant={sortOption === 'updated_at' ? 'default' : 'outline'}
                                    onClick={() => applySort('updated_at')}
                                    className="w-full flex justify-start gap-2"
                                >
                                    <ClockIcon className="h-4 w-4" />
                                    Data de modificação
                                </Button>
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>
            </WaveBackgroundLayout>
            
            {/* Add the LoadingScreen component */}
            <LoadingScreen ref={loadingRef} />
        </>
    );
};
