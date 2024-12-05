import React, { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useLocation, useNavigate } from "react-router-dom";
import useSWRMutation from "swr/mutation";
import { getBaseURL, patchRequest, postRequest } from "@/data/common/HttpExtensions.ts";

export default function WoundAddUpdateImage() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id as number;
    const woundUpdateId = location.state?.wound_update_id as number;

    const { trigger: postTrigger } = useSWRMutation(getBaseURL("/images/"), postRequest);
    const { trigger: patchTrigger } = useSWRMutation(getBaseURL(`/tracking-records/${woundUpdateId}`), patchRequest);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoFile(file);
            setPhotoUrl(url);
        }
    };

    const handleRetake = () => {
        setPhotoFile(null);
        setPhotoUrl(null);
    };

    const updateWoundUpdateWithImageId = async (imageId: number) => {
        console.log("imageId", imageId)
        const payload = {
            image_id: imageId,
            created_at: "2024-12-04"
        };

        console.log(await patchTrigger(payload))
    };

    const uploadImageToUrl = async (url: string): Promise<boolean> => {
        if (!photoFile) {
            console.error("No photo file provided.");
            return false;
        }

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "image/jpeg",
                },
                credentials: "include",
                body: photoFile,
            });

            if (!response.ok) {
                console.error(`Failed to upload image: ${response.statusText}`);
                return false;
            }

            console.log("Image uploaded successfully.");
            return true;
        } catch (err) {
            console.error("Error uploading image:", err);
            return false;
        }
    };

    const onSubmit = async () => {
        if (!photoFile) return;

        try {
            const payload = {
                extension: "jpg",
            };
            const result = await postTrigger(payload);

            const uploadSuccess = await uploadImageToUrl(result.upload_url);
            if (uploadSuccess) {
                await updateWoundUpdateWithImageId(result.image_id);
                navigate('/wound/add-update/conduct', { state: { wound_id: woundId } });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error uploading image. Please try again.");
        }
    };

    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Foto</div>

            <div className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">
                <div className=" text-sm font-semibold space-y-2">
                    <p className="font-bold text-base">Orientações para a foto:</p>
                    <ol className="space-y-2 list-decimal pl-5">
                        <li>Após a limpeza da ferida, secar as bordas da ferida;</li>
                        <li>Utilizar um fundo branco e retirar quaisquer objetos que podem aparecer na foto;</li>
                        <li>Usar uma régua descartável (com as iniciais do participante e a semana do tratamento);</li>
                        <li>A distância da foto será 20 cm, sendo medida com a própria régua descartável;</li>
                        <li>Não utilizar flash;</li>
                        <li>Conferir a nitidez da foto tirada.</li>
                    </ol>
                </div>

                <div className="border-2 border-gray-200 rounded-lg w-full mt-8 h-[190px] overflow-hidden">
                    <label className="block text-center cursor-pointer w-full h-full">
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt="Uploaded photo"
                                className="w-auto h-auto object-cover" // Scale up the image
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <ImagePlus className="w-16 h-16"/>
                            </div>
                        )}
                    </label>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6 !mt-8">
                    <div className="flex justify-center gap-4">
                        <Button type="button" onClick={handleRetake}>
                            Tirar novamente
                        </Button>

                        <Button type="submit" disabled={!photoUrl} onClick={onSubmit}>
                            Enviar
                        </Button>
                    </div>

                    <Button type="button" onClick={() => {
                        navigate('/wound/add-update/conduct', {state: {wound_id: woundId, wound_update_id: woundUpdateId}});
                    }}>
                        Pular
                    </Button>
                </div>


            </div>
        </div>
    );
};
