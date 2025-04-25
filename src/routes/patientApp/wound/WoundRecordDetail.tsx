import { ArrowLeft, Image } from "lucide-react"
import { useEffect } from "react";
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest } from "@/data/common/HttpExtensions.ts";
import type { WoundRecord } from "@/data/common/Mapper.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
    getExudateAmount,
    getExudateType,
    getSkinAround,
    getTissueType,
    getWoundEdges
} from "@/data/common/LocalDataMapper.tsx";


export default function WoundRecordDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id as number;
    const trackingRecordId = location.state?.tracking_record_id as number;

    const {
        data: woundRecord, trigger, isMutating
    } = useSWRMutation<WoundRecord>(getBaseURL(`/tracking-records/${trackingRecordId}`), getRequest);

    useEffect(() => {
        trigger();
    }, [trigger]);

    console.log("data", woundRecord)
    console.log("photoUrl", `https://${import.meta.env.VITE_MINIO_DOMAIN}/${import.meta.env.VITE_MINIO_IMAGES_BUCKET}/${woundRecord?.image_id}.jpg`)

    return (
        <div className="flex flex-col w-full h-full items-center">
            {isMutating ? (
                <p>Carregando detalhes de atualização...</p>
            ) : (
                woundRecord && (
                    <div className="flex-1 max-h-screen w-full mx-auto p-8 space-y-4 overflow-y-auto">
                        <div className="flex flex-col justify-center items-center">
                            <div className="flex justify-between w-full relative">
                                <div
                                    className="border border-gray-300 rounded flex items-center justify-center cursor-pointer"
                                    onClick={() => {
                                        navigate('/wound/detail', {state: {wound_id: woundId}});
                                    }}
                                >
                                    <ArrowLeft className="text-black p-2" size={32}/>
                                </div>
                                <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">Ferida</h1>
                            </div>
                            {format(parseISO(woundRecord.track_date), "dd/MM/yyyy")}
                        </div>


                        <div className="border-2 border-gray-200 rounded-lg w-full mt-8 h-[190px] overflow-hidden">
                            <label className="block text-center cursor-pointer w-full h-full">
                                {woundRecord?.image_id ? (
                                    <img
                                        src={`https://${import.meta.env.VITE_MINIO_DOMAIN}/${import.meta.env.VITE_MINIO_IMAGES_BUCKET}/${woundRecord.image_id}.jpg`}
                                        alt="Uploaded photo"
                                        className="w-auto h-auto object-cover" // Scale up the image
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full">
                                        <Image className="w-16 h-16"/>
                                    </div>
                                )}
                            </label>
                        </div>

                        <h1 className="text-xl font-semibold">Informações básicas</h1>

                        <div>
                            <p className="font-semibold">Tamanho</p>
                            <p>{woundRecord.wound_width} cm de largura, {woundRecord.wound_length} cm de altura
                                (Área média: {woundRecord.wound_width && woundRecord.wound_length
                                    ? (Number(woundRecord.wound_width) * Number(woundRecord.wound_length)).toFixed(2)
                                    : "0"} cm²)</p>
                        </div>

                        <div>
                            <p className="font-semibold">Nível da dor</p>
                            <p>{woundRecord.pain_level}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Quantidade de exsudato</p>
                            <p>{getExudateAmount(woundRecord.exudate_amount)}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Tipo de exsudato</p>
                            <p>{getExudateType(woundRecord.exudate_type)}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Tipo de tecido</p>
                            <p>{getTissueType(woundRecord.tissue_type)}</p>
                        </div>

                        <h1 className="text-xl font-semibold">Informações complementares</h1>

                        <div className="grid grid-cols-2">
                            <div>
                                <p className="font-semibold">Trocas de curativo</p>
                                <p>{woundRecord.dressing_changes_per_day}</p>
                            </div>

                            <div>
                                <p className="font-semibold">Febre nas 48h anteriores</p>
                                <p>{woundRecord.had_a_fever ? "Sim" : "Não"}</p>
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold">Pele ao redor da ferida</p>
                            <p>{getSkinAround(woundRecord.skin_around_the_wound)}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Bordas da ferida</p>
                            <p>{getWoundEdges(woundRecord.wound_edges)}</p>
                        </div>

                        <h1 className="text-xl font-semibold">Anotações extras</h1>

                        <div className="mt-4 w-full">
                            <h3 className="text-lg font-semibold">Anotações extras</h3>
                            <p>{woundRecord.extra_notes}</p>
                        </div>

                        <div className="mt-4 w-full">
                            <h3 className="text-lg font-semibold">Orientações dadas ao paciente</h3>
                            <p>{woundRecord.guidelines_to_patient}</p>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};