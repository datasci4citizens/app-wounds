import { ArrowLeft } from "lucide-react"
import { useEffect } from "react";
import useSWRMutation from "swr/mutation";
import { getRequest } from "@/data/common/HttpExtensions.ts";
import type { Wound } from "@/data/common/Mapper.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";


export default function WoundRecordDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id as number;

    const {
        data: wound, trigger, isMutating
    } = useSWRMutation<Wound>(`http://localhost:8000/wounds/${woundId}/tracking-records/`, getRequest);

    useEffect(() => {
        trigger();
    }, [trigger]);

    return (
        <div className="h-full overflow-hidden">
            {isMutating ? (
                <p>Carregando detalhes de atualização...</p>
            ) : (
                wound && (
                    <div className="flex flex-col h-full w-full items-center px-8">
                        <div className="flex items-center justify-between w-full relative">
                            <div
                                className="border border-gray-300 rounded flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                    navigate('/wound/detail', {state: {wound_id: wound.wound_id}});
                                }}
                            >
                                <ArrowLeft className="text-black p-2" size={32}/>
                            </div>
                            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">Ferida</h1>
                        </div>
                        {format(parseISO(wound.start_date), "dd/MM/yyyy")}
                    </div>
                )
            )}
        </div>
    );
};