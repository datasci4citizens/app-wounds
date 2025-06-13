import React, { useState, useRef } from 'react'
import { ImagePlus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate, useLocation } from "react-router-dom";
import { useWoundUpdate } from "@/routes/specialistApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";
import { LoadingScreen, type LoadingScreenHandle } from '@/components/ui/new/loading/LoadingScreen';
import { WaveBackgroundLayout } from '@/components/ui/new/wave/WaveBackground';
import { ProfessionalIcon } from '@/components/ui/new/ProfessionalIcon';
import PageTitleWithBackButton from '@/components/shared/PageTitleWithBackButton';

// Componente para exibir mensagens de alerta simples (consistente com WoundCreate)
function AlertMessage({ type, message }: { type: 'error' | 'success', message: string }) {
    const styles = type === 'error' 
        ? 'bg-red-50 border-red-300 text-red-700' 
        : 'bg-green-50 border-green-300 text-green-700';
    
    return (
        <div className={`border ${styles} px-4 py-3 rounded-lg shadow-sm relative mb-4 text-sm font-medium`} role="alert">
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
        <>
            {/* Removido estilo global que não é suportado neste contexto */}
            <WaveBackgroundLayout className="absolute inset-0 overflow-auto">
                <div className="flex flex-col w-full min-h-full items-center px-6">
                    {/* Header with Professional Icon */}
                    <div className="flex justify-center items-center mt-6 mb-6">
                        <ProfessionalIcon size={0.6} borderRadius="50%" />
                    </div>
                    <PageTitleWithBackButton 
                        title="Envio de imagem"
                        onBackClick={() => navigate(-1)}
                        className="mb-6 [&>h1]:text-lg [&>h1]:font-medium"
                    />

                    <div className="flex flex-col w-full h-full items-center">
                        <div className="flex-1 max-h-screen w-full mx-auto space-y-6">
                            {/* Exibir mensagens de alerta quando necessário */}
                            {alertMessage && (
                                <AlertMessage type={alertMessage.type} message={alertMessage.message} />
                            )} 
                            <div className="bg-white rounded-lg shadow-sm p-4 border border-[#A6BBFF]/30">
                                <h2 className="text-[#0120AC] text-base font-medium mb-2">Orientações para a foto:</h2>
                                <ol className="space-y-1.5 list-decimal pl-5">
                                    <li className="text-[#0120AC] text-xs leading-tight">
                                        Higienize o local e seque bem as bordas da ferida antes de tirar a foto.
                                    </li>
                                    <li className="text-[#0120AC] text-xs leading-tight">
                                        Utilize um fundo branco e remova objetos ou elementos que possam aparecer na imagem.
                                    </li>
                                    <li className="text-[#0120AC] text-xs leading-tight">
                                        Posicione uma régua descartável próxima à ferida, contendo as iniciais do paciente e a semana do tratamento anotadas.
                                    </li>
                                    <li className="text-[#0120AC] text-xs leading-tight">
                                        Mantenha uma distância de 20 cm entre a câmera e a ferida — utilize a régua para medir.
                                    </li>
                                    <li className="text-[#0120AC] text-xs leading-tight">
                                        Desative o flash da câmera para evitar distorções de cor.
                                    </li>
                                    <li className="text-[#0120AC] text-xs leading-tight">
                                        Após tirar a foto, verifique a nitidez e o foco.
                                    </li>
                                </ol>
                            </div>

                            <div className="flex justify-center items-center w-full mt-8">
                                <div className="bg-white border border-[#A6BBFF]/50 rounded-lg w-56 h-56 overflow-hidden shadow-sm flex flex-col items-center justify-center">
                                    <label className="block text-center cursor-pointer w-full h-full flex flex-col items-center justify-center">
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
                                                className="w-full h-full object-contain" 
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-full h-full p-4">
                                                <div className="w-28 h-28 bg-[#A6BBFF]/20 rounded-full flex items-center justify-center mb-4">
                                                    <ImagePlus className="w-12 h-12 text-[#0120AC]"/>
                                                </div>
                                                <span className="text-[#0120AC] text-sm font-medium">Enviar imagem</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-6 !mt-8">
                                <div className="flex justify-center gap-4">
                                    {photoUrl && (
                                        <Button 
                                            type="button" 
                                            onClick={handleRetake}
                                            disabled={isSubmitting}
                                            variant="outline"
                                            className="border-[#0120AC] text-[#0120AC] hover:bg-[#0120AC]/5 py-1 px-4 rounded-full text-sm font-medium"
                                        >
                                            Tirar novamente
                                        </Button>
                                    )}

                                    <Button 
                                        type="submit" 
                                        disabled={!photoUrl || isSubmitting} 
                                        onClick={onSubmit}
                                        className={`bg-[#0120AC] hover:bg-[#0120AC]/90 text-white py-1 px-6 rounded-full text-sm font-medium flex items-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        {isSubmitting ? "Enviando..." : "Enviar"}
                                        {!isSubmitting && <ArrowLeft className="h-3.5 w-3.5 rotate-180" />}
                                    </Button>
                                </div>

                                {showSkipConfirmation ? (
                                    <div className="flex justify-center gap-4">
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowSkipConfirmation(false)}
                                            disabled={isSubmitting}
                                            className="border-[#0120AC] text-[#0120AC] hover:bg-[#0120AC]/5 py-1 px-4 rounded-full text-sm font-medium"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button 
                                            type="button"
                                            onClick={confirmSkip}
                                            disabled={isSubmitting}
                                            className="bg-[#0120AC] hover:bg-[#0120AC]/90 text-white py-1 px-4 rounded-full text-sm font-medium"
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
                                        className="border-[#0120AC] text-[#0120AC] hover:bg-[#0120AC]/5 py-1 px-4 rounded-full text-sm font-medium mt-2"
                                    >
                                        Pular
                                    </Button>
                                )}
                            </div>

                            {/* Componente LoadingScreen */}
                            <LoadingScreen ref={loadingRef} className="bg-[#0120AC]/10" />
                        </div>
                    </div>
            </div>
            </WaveBackgroundLayout>
        </>
    );
};
