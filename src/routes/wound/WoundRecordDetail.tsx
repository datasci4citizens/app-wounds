import { ArrowLeft, Image } from "lucide-react"
import { useEffect } from "react";
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest } from "@/data/common/HttpExtensions.ts";
import type { WoundRecord } from "@/data/common/Mapper.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";


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
        <div className="h-full overflow-hidden">
            {isMutating ? (
                <p>Carregando detalhes de atualização...</p>
            ) : (
                woundRecord && (
                    <div className="flex flex-col h-full w-full items-center px-8">
                        <div className="flex items-center justify-between w-full relative">
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
                        {format(parseISO(woundRecord.created_at), "dd/MM/yyyy")}

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

                    </div>
                )
            )}
        </div>
    );
};