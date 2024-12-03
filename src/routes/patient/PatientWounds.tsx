import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { ArrowLeft, Edit, FileText, Plus } from "lucide-react"
import { useEffect } from "react";
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest } from "@/data/common/HttpExtensions.ts";
import type { Wound, WoundPatient } from "@/data/common/Mapper.ts";
import { calculateAge } from "@/data/common/Mapper.ts";
import { useLocation, useNavigate } from "react-router-dom";

const WoundCard = ({wound, index}: { wound: Wound, index: number }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate('/wound/detail', {state: {wound_id: wound.wound_id}});
    };

    return (
        <Card className="mb-4 w-full shadow-sm border-b border-gray-200 cursor-pointer" onClick={handleCardClick}>
            <CardContent className="p-4 flex justify-between items-center">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{`Ferida ${index + 1}`}</h3>
                    <div className="space-y-1 text-sm text-gray-500 leading-tight">
                        <p>Tipo de ferida: {wound.wound_type}</p>
                        <p>Local: {wound.wound_region}</p>
                        <p>Subregião: {wound.wound_subregion}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function PatientsWounds() {
    const navigate = useNavigate();
    const location = useLocation();
    const patient_id = location.state?.patient_id as number;

    const {
        data: woundPatient, trigger, isMutating
    } = useSWRMutation<WoundPatient>(getBaseURL(`/patients/${patient_id}/wounds`), getRequest);

    useEffect(() => {
        trigger();
    }, [trigger]);

    const wounds = woundPatient?.wounds || []
    console.log(wounds)

    return (
        <div className="h-full overflow-hidden">
            {isMutating ? (
                <p>Carregando dados de paciente...</p>
            ) : (
                woundPatient && (
                    <div className="flex flex-col h-full w-full items-center px-8">
                        <div className="flex flex-col items-center w-full">
                            <div className="flex w-full justify-between">
                                <div
                                    className={`border border-gray-300 rounded flex items-center justify-center cursor-pointer`}
                                    onClick={() => {
                                        navigate("/patient/list")
                                    }}>
                                    <ArrowLeft className="text-black p-2" size={32}/>
                                </div>
                                <div
                                    className={`border border-gray-300 rounded flex items-center justify-center cursor-pointer`}
                                    onClick={() => {
                                    }}>
                                    <Edit className="text-black p-2" size={32}/>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold mb-4 mt-4">{woundPatient.name}</h1>
                        </div>

                        <div className="flex flex-col text-sm leading-relaxed space-y-2 self-start">
                            <p>
                                <span
                                    className="font-bold text-base">Idade: </span> {calculateAge(new Date(woundPatient.birthday))} anos
                            </p>
                            <p>
                                <span className="font-bold text-base">Comorbidades: </span>
                                {woundPatient.comorbidities.length > 0 ? (
                                    woundPatient.comorbidities.map((item) => item.name).join(", ")
                                ) : (
                                    'Nenhuma comorbidade registrada.'
                                )}
                            </p>
                            <p>
                                <span className="font-bold text-base">Hábitos: </span> {woundPatient.drink_frequency}
                            </p>
                            <h1 className="text-2xl font-semibold mb-4 !mt-6">Feridas:</h1>
                        </div>

                        <div className="flex flex-col max-h-screen w-full overflow-y-auto mt-6 pb-6">
                            {wounds.length > 0 ? (
                                wounds.map((wound, index) => (
                                    <WoundCard key={index} wound={wound} index={index}/>
                                ))
                            ) : (
                                <div className="flex justify-center">
                                    <p>Sem feridas cadastradas.</p>
                                </div>
                            )}
                        </div>

                        <Button type="button" className="bg-sky-900 mt-6" onClick={() => {
                            navigate('/wound/create', {state: {patient_id: patient_id}});
                        }}>
                            <Plus className="mr-2 h-5 w-5"/>
                            Adicionar Ferida
                        </Button>
                        <Button type="button" className="bg-sky-900 mt-6" onClick={() => {
                        }}>
                            <FileText className="mr-2 h-5 w-5"/>
                            Gerar PDF
                        </Button>
                        <Button type="button" className="bg-sky-900 mt-6 mb-6" onClick={() => {
                        }}>
                            <FileText className="mr-2 h-5 w-5"/>
                            Gerar planilha
                        </Button>
                    </div>
                )
            )}
        </div>
    );
};