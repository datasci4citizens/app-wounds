import { Input } from "@/components/ui/input.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { Plus, Search } from "lucide-react"
import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest } from "@/data/common/HttpExtensions.ts";
import type { Patient, Specialist } from "@/data/common/Mapper.ts";
import { formatPatientBirthday } from "@/data/common/Mapper.ts";
import { useNavigate } from "react-router-dom";

const PatientCard = ({patient}: { patient: Patient }) => {
    const navigate = useNavigate();

    const id = patient.patient_id
    const handleCardClick = () => {
        navigate('/patient/wounds', {state: {patient_id: id}}); // Pass the patient data through state
    };

    return (
        <Card className="mb-4 w-full shadow-sm border-b border-gray-200 cursor-pointer" onClick={handleCardClick}>
            <CardContent className="p-4 flex justify-between items-center">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{patient.name}</h3>
                    <div className="space-y-1 text-sm text-gray-500 leading-tight">
                        <p>Data Nascimento: {patient.birthday}</p>
                        <p>Gênero: {patient.gender}</p>
                        <p>Telefone: {patient.phone_number}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function PatientsPage() {
    const navigate = useNavigate();

    const {
        data, trigger,
    } = useSWRMutation<Specialist>(getBaseURL("specialists//patients/"), getRequest);
    console.log(data)

    useEffect(() => {
        trigger();
    }, [trigger]);

    const [searchTerm, setSearchTerm] = useState('');
    const patients: Patient[] = formatPatientBirthday(data?.patients || []);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full items-center px-8">
            <div className="flex flex-col items-center w-full">
                <h1 className="text-2xl font-bold mb-4">Pacientes</h1>
                <div className="relative w-full mt-12">
                    <Input
                        type="text"
                        placeholder="Pesquise o nome do paciente"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={20}/>
                </div>
            </div>

            <div className="flex flex-col max-h-screen w-full overflow-y-auto mt-6 pb-6">
                {filteredPatients.map((patient, index) => (
                    <PatientCard key={index} patient={patient}/>
                ))}
            </div>

            <Button type="button" className="w-full bg-sky-900 mt-6 mb-6" onClick={() => {
                navigate("/patient/create")
            }}>
                <Plus className="mr-2 h-5 w-5"/>
                Adicionar Paciente
            </Button>
        </div>
    );
};