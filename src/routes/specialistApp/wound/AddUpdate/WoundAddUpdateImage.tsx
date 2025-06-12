import React, { useState, useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate, useLocation } from "react-router-dom";
import { useWoundUpdate } from "@/routes/specialistApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";
import { LoadingScreen, type LoadingScreenHandle } from '@/components/ui/new/loading/LoadingScreen';

// Componente para exibir mensagens de alerta simples (consistente com WoundCreate)
function AlertMessage({ type, message }: { type: 'error' | 'success', message: string }) {
    const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    
    return (
        <div className={`border ${bgColor} px-4 py-3 rounded relative mb-4`} role="alert">
            <span className="block sm:inline">{message}</span>
        </div>
    );
}

export default function WoundAddUpdateImage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { patient_id, wound_id } = location.state || {};
    const { woundUpdate, setWoundUpdate } = useWoundUpdate(); // Obtenha woundUpdate do contexto
    const loadingRef = useRef<LoadingScreenHandle>(null);

    // Log do estado no início
    console.log("WoundAddUpdateImage recebeu state:", location.state);
    console.log("WoundAddUpdateImage - context wound_id:", woundUpdate?.wound_id);
    console.log("WoundAddUpdateImage - location wound_id:", wound_id);
    
    // Logs detalhados para diagnóstico
    console.log("================ DIAGNÓSTICO DE PATIENT_ID ================");
    console.log("Location object completo:", location);
    console.log("Location.state completo:", location.state);
    console.log("patient_id extraído:", patient_id);
    console.log("wound_id extraído:", wound_id);
    console.log("==========================================================");
    
    // Estado para mensagens de alerta
    const [alertMessage, setAlertMessage] = useState<{type: 'error' | 'success', message: string} | null>(null);

    // Use the same strategy as WoundCreate
    const apiUrl = `${import.meta.env.VITE_SERVER_URL}/images/`;
    
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Limpar mensagens de alerta anteriores
        setAlertMessage(null);
        
        const file = event.target.files?.[0];
        if (file) {
            // Validar o tipo de arquivo
            if (!file.type.startsWith('image/')) {
                setAlertMessage({
                    type: 'error',
                    message: "Por favor, selecione um arquivo de imagem válido."
                });
                return;
            }
            
            // Validar o tamanho do arquivo (máximo 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB em bytes
            if (file.size > maxSize) {
                setAlertMessage({
                    type: 'error',
                    message: "A imagem é muito grande. O tamanho máximo permitido é 10MB."
                });
                return;
            }
            
            const url = URL.createObjectURL(file);
            setPhotoFile(file);
            setPhotoUrl(url);
        }
    };

    const handleRetake = () => {
        setPhotoFile(null);
        setPhotoUrl(null);
        setAlertMessage(null); // Limpar mensagens de alerta ao retirar a foto
    };

    const onSubmit = async () => {
        if (!photoFile) {
            setAlertMessage({
                type: 'error',
                message: "Por favor, selecione uma foto antes de enviar."
            });
            return;
        }

        // Evitar submissões múltiplas
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setAlertMessage(null); // Limpar mensagens de alerta anteriores
        
        // Mostrar tela de carregamento
        loadingRef.current?.show();
        
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                loadingRef.current?.hide();
                setIsSubmitting(false);
                setAlertMessage({
                    type: 'error',
                    message: "Sua sessão expirou. Por favor, faça login novamente."
                });
                
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }

            // Garantir um tempo mínimo de carregamento para melhor feedback visual
            const startTime = Date.now();
            const minimumLoadingTime = 500;

            // Create a FormData object to send both the JSON data and image file
            const formData = new FormData();
            formData.append('image', photoFile);
            
            // Detectar a extensão correta com base no tipo MIME
            const fileExtension = photoFile.type.split('/')[1] || 'jpg';
            formData.append('extension', fileExtension);

            const imageResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    // Don't set Content-Type when using FormData, the browser will set it automatically
                },
                body: formData,
            });

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

            if (!imageResponse.ok) {
                // Aguardar o tempo mínimo antes de mostrar o erro
                setTimeout(() => {
                    loadingRef.current?.hide();
                    setIsSubmitting(false);
                    
                    // Tratar diferentes tipos de erros HTTP
                    switch (imageResponse.status) {
                        case 400:
                            setAlertMessage({
                                type: 'error',
                                message: "Formato de imagem inválido ou corrompido."
                            });
                            break;
                        case 401:
                            setAlertMessage({
                                type: 'error',
                                message: "Sua sessão expirou. Por favor, faça login novamente."
                            });
                            setTimeout(() => navigate('/login'), 2000);
                            break;
                        case 413:
                            setAlertMessage({
                                type: 'error',
                                message: "A imagem é muito grande. Por favor, use uma imagem menor."
                            });
                            break;
                        default:
                            setAlertMessage({
                                type: 'error',
                                message: "Erro ao enviar a imagem. Por favor, tente novamente."
                            });
                    }
                }, remainingTime);
                return;
            }
            
            const imageResult = await imageResponse.json();
            
            // Verificar se temos um ID de imagem válido
            const imageId = imageResult?.id || imageResult?.image_id;
            if (!imageId) {
                setTimeout(() => {
                    loadingRef.current?.hide();
                    setIsSubmitting(false);
                    setAlertMessage({
                        type: 'error',
                        message: "Erro ao processar a imagem. Por favor, tente novamente."
                    });
                }, remainingTime);
                return;
            }
            
            // Update wound with the image ID
            setWoundUpdate((prev) => ({
                ...prev,
                image_id: imageId
            }));
            
            // Aguardar o tempo mínimo antes de navegar
            setTimeout(() => {
                loadingRef.current?.hide();
                setAlertMessage({
                    type: 'success',
                    message: "Imagem enviada com sucesso. Prosseguindo para a próxima etapa."
                });
                
                // Aguardar um momento para mostrar a mensagem de sucesso antes de navegar
                setTimeout(() => {
                    // Use o wound_id do contexto se o da URL não estiver disponível
                    const finalWoundId = wound_id || woundUpdate?.wound_id;
                    
                    console.log("Navegando para Conduta com wound_id:", finalWoundId);
                    
                    // Navegando para a próxima página
                    navigate('/specialist/wound/add-update/conduct', { 
                        state: { 
                            patient_id, 
                            wound_id: finalWoundId
                        } 
                    });
                }, 1000);
            }, remainingTime);
            
        } catch (error) {
            console.error("Error submitting form:", error);
            loadingRef.current?.hide();
            setIsSubmitting(false);
            setAlertMessage({
                type: 'error',
                message: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente."
            });
        }
    };

    // Remove a função uploadImageToUrl que não é utilizada
    
    // Modificar o botão Skip para confirmar antes de pular
    const handleSkip = () => {
        setAlertMessage({
            type: 'error',
            message: "Tem certeza que deseja continuar sem adicionar uma foto? Uma foto é importante para o acompanhamento adequado da ferida."
        });
        
        // Adicionar botões de confirmação
        setShowSkipConfirmation(true);
    };
    
    const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
    
    const confirmSkip = () => {
        // Mostrar o loading por um breve momento antes de navegar
        loadingRef.current?.show();
        
        setTimeout(() => {
            loadingRef.current?.hide();
            navigate('/specialist/wound/add-update/conduct', {
                state: { patient_id, wound_id }
            });
        }, 500);
    };

    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Foto</div>

            <div className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">
                {/* Exibir mensagens de alerta quando necessário */}
                {alertMessage && (
                    <AlertMessage type={alertMessage.type} message={alertMessage.message} />
                )}
                
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
                        <Button 
                            type="button" 
                            onClick={handleRetake}
                            disabled={!photoUrl || isSubmitting}
                        >
                            Tirar novamente
                        </Button>

                        <Button 
                            type="submit" 
                            disabled={!photoUrl || isSubmitting} 
                            onClick={onSubmit}
                            className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
                        >
                            {isSubmitting ? "Enviando..." : "Enviar"}
                        </Button>
                    </div>

                    {showSkipConfirmation ? (
                        <div className="flex justify-center gap-4">
                            <Button 
                                type="button"
                                variant="outline"
                                onClick={() => setShowSkipConfirmation(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="button"
                                onClick={confirmSkip}
                                disabled={isSubmitting}
                            >
                                Confirmar pular
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            type="button" 
                            onClick={handleSkip}
                            variant="outline"
                            disabled={isSubmitting}
                        >
                            Pular
                        </Button>
                    )}
                </div>

                {/* Componente LoadingScreen */}
                <LoadingScreen ref={loadingRef} />
            </div>
        </div>
    );
};
