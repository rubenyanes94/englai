
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Props {
  onBack: () => void;
  onVideoGenerated: (url: string) => void;
}

const VideoGenerator: React.FC<Props> = ({ onBack, onVideoGenerated }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reassuringMessages = [
    "Dibujando la caricatura del Profesor James...",
    "James está preparando su mejor clase...",
    "Cargando los marcadores para la pizarra...",
    "Animando los gestos del tutor...",
    "Casi listo para dar el salto a la pantalla..."
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!selectedImage) return;

    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }

      setIsGenerating(true);
      setError(null);
      setGeneratedVideoUrl(null);

      let msgIndex = 0;
      setLoadingMessage(reassuringMessages[0]);
      const messageInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % reassuringMessages.length;
        setLoadingMessage(reassuringMessages[msgIndex]);
      }, 4000);

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      const base64Data = selectedImage.split(',')[1];

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A friendly caricature of Professor James, a charismatic English teacher with a big smile, teaching an English lesson in a colorful classroom, vibrant cartoon style, 3d animation aesthetic, high quality.',
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      clearInterval(messageInterval);
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${import.meta.env.VITE_API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedVideoUrl(url);
      } else {
        throw new Error("No se pudo generar el video. Intenta de nuevo.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("Error de configuración de API. Selecciona tu proyecto con facturación.");
        await (window as any).aistudio.openSelectKey();
      } else {
        setError(err.message || "Ocurrió un error inesperado.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-md z-30">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
          <span className="material-icons">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-800">Tutor Animado</h1>
      </header>

      <main className="px-6 pb-12 flex-1 flex flex-col">
        {!generatedVideoUrl && !isGenerating && (
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-primary text-4xl">face</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Paso 1: Sube una foto</h2>
              <p className="text-slate-500 text-sm mb-6 px-4">
                Sube una imagen de referencia para que James aprenda tus expresiones o para crear su versión caricaturizada.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  selectedImage ? 'border-primary bg-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Reference" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="material-icons text-slate-300 text-5xl mb-2">add_photo_alternate</span>
                    <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Toca para subir</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1"></div>

            <button 
              disabled={!selectedImage}
              onClick={generateVideo}
              className="w-full py-4 bg-primary disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-primary/25 active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
            >
              <span className="material-icons">magic_button</span>
              Generar Caricatura
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <span className="material-icons text-3xl animate-pulse">movie</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Creando Magia...</h2>
            <p className="text-slate-500 font-medium h-12 flex items-center justify-center text-center">
              {loadingMessage}
            </p>
          </div>
        )}

        {generatedVideoUrl && !isGenerating && (
          <div className="space-y-6 flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
              <video 
                src={generatedVideoUrl} 
                className="w-full rounded-2xl shadow-inner aspect-[9/16] object-cover" 
                controls 
                autoPlay 
                loop 
              />
            </div>
            
            <button 
              onClick={() => onVideoGenerated(generatedVideoUrl)}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
            >
              Usar en mi Clase
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700">
            <span className="material-icons">error_outline</span>
            <p className="text-xs">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoGenerator;
