import React, { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useLocation, useNavigate } from "react-router-dom";

export default function WoundAddUpdateImage() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id as number;

    const [photoUrl, setPhotoUrl] = useState<string | null>(null)

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPhotoUrl(url)
        }
    }

    const handleRetake = () => {
        setPhotoUrl(null)
    }

    const onSubmit = () => {
        console.log(photoUrl)
        navigate('/wound/add-update/conduct', {state: {wound_id: woundId}})
    }

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
                                <ImagePlus className="w-16 h-16" />
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

                    <Button type="button" onClick={() => {navigate('/wound/add-update/conduct', {state: {wound_id: woundId}});}}>
                        Pular
                    </Button>
                </div>


            </div>
        </div>
    );
};