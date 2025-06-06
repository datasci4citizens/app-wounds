import { Button } from "@/components/ui/button.tsx"
import { ArrowLeft, ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react"
import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest } from "@/data/common/HttpExtensions.ts";
import type { Wound, WoundRecord } from "@/data/common/Mapper.ts";
import { formatDate } from "@/data/common/Mapper.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.tsx";
import { getExudateType, getRegionDescription, getTissueType, getWoundType } from "@/data/common/LocalDataMapper.tsx";

const WoundRecordCollapsable = ({woundRecord, woundId}: { woundRecord: WoundRecord, woundId: number }) => {
    const navigate = useNavigate();
    const handleSeeMoreButtonClick = () => {
        navigate('/specialist/wound/record-detail', {
            state: {
                wound_id: woundId,
                tracking_record_id: woundRecord.tracking_record_id
            }
        }); // Pass the patient data through state
    };

    const [isOpen, setIsOpen] = useState(false)

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="flex border border-gray-300 rounded ursor-pointer p-3"
        >
            <CollapsibleTrigger asChild>
                <div className="flex flex-col w-full px-4">
                    <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold">{formatDate(woundRecord.track_date)}</p>
                        {isOpen ? <ChevronsDownUp className="h-4 w-4"/> :
                            <ChevronsUpDown className="h-4 w-4"/>}
                    </div>
                    <CollapsibleContent>
                        <div
                            className="flex flex-col text-sm leading-relaxed space-y-3 self-start mt-6">
                            <p>
                                <span
                                    className="font-semibold text-base">Tamanho: </span>
                                {(Number(woundRecord.wound_width) * Number(woundRecord.wound_length)).toFixed(2)}

                            </p>
                            <p>
                                <span
                                    className="font-semibold text-base">Nível de dor: </span> {woundRecord.pain_level}
                            </p>
                            <p>
                                <span
                                    className="font-semibold text-base">Tipo de tecido: </span> {getTissueType(woundRecord.tissue_type)}
                            </p>
                            <p>
                                <span
                                    className="font-semibold text-base">Exsudato: </span> {getExudateType(woundRecord.exudate_type)}
                            </p>
                            <Button type="button" className="bg-sky-900 !mt-6" onClick={handleSeeMoreButtonClick}>
                                Ver mais
                            </Button>
                        </div>
                    </CollapsibleContent>
                </div>

            </CollapsibleTrigger>
        </Collapsible>
    );
};

export default function WoundDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id as number;

    const {
        data: wound, trigger, isMutating
    } = useSWRMutation<Wound>(getBaseURL(`/wounds/${woundId}/tracking-records/`), getRequest);

    useEffect(() => {
        trigger();
    }, [trigger]);

    return (
        <div className="h-full overflow-hidden">
            {isMutating ? (
                <p>Carregando detalhes de ferida...</p>
            ) : (
                wound && (
                    <div className="flex flex-col h-full w-full items-center px-8">
                        <div className="flex items-center justify-between w-full relative">
                            <div
                                className="border border-gray-300 rounded flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                    navigate('/specialist/patient/wounds', {state: {patient_id: wound.patient_id}});
                                }}
                            >
                                <ArrowLeft className="text-black p-2" size={32}/>
                            </div>
                            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">Ferida</h1>
                        </div>

                        <div className="flex flex-col text-sm leading-relaxed space-y-2 self-start mt-6">
                            <p>
                                <span
                                    className="font-bold text-base">Local: </span> {getRegionDescription(wound.region)}
                            </p>
                            <p>
                                <span className="font-bold text-base">Tipo: </span> {getWoundType(wound.type)}
                            </p>
                            <p>
                                <span className="font-bold text-base">Data inicio: </span>
                                {format(parseISO(wound.start_date), "dd/MM/yyyy")}
                            </p>
                            <h1 className="text-2xl font-semibold mb-4 !mt-6">Atualizações:</h1>
                        </div>

                        <div className="flex flex-col max-h-screen w-full overflow-y-auto mt-6 pb-6 space-y-2">
                            {wound.tracking_records && wound.tracking_records.length > 0 ? (
                                wound.tracking_records.map((woundRecord, index) => (
                                    <WoundRecordCollapsable key={index} woundRecord={woundRecord} woundId={woundId}/>
                                ))
                            ) : (
                                <div className="flex justify-center">
                                    <p>Sem atualizações cadastradas.</p>
                                </div>
                            )}
                        </div>

                        <Button type="button" className="bg-sky-900 mt-6 mb-6" onClick={() => {
                            navigate('/specialist/wound/add-update', {state: {wound_id: woundId}});
                        }}>
                            <Plus className="mr-2 h-5 w-5"/>
                            Adicionar atualização
                        </Button>
                    </div>
                )
            )}
        </div>
    );
};