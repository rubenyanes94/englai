import React, { useState, useRef, useEffect } from 'react';
import { type User, CEFRLevel, type LevelCurriculum } from '../types';

interface Props {
  user: User;
  onExit: () => void;
  onCompleteModule: () => void;
}

// 1. NUEVA INTERFAZ: El Guion del Video
interface TimelineEvent {
  id: string;
  startAt: number; // En segundos
  endAt: number;   // En segundos
  title: string;
  type: 'intro' | 'grammar' | 'vocabulary' | 'tip';
  content: string;
  items?: string[]; // Para listas de vocabulario o ejemplos
}

// Simulación de los datos del nivel (Mantenemos tu estructura)
const currModule = { title: "Presentaciones y Saludos", description: "Verbo To Be, pronombres y cortesía." };

// 2. EL GUION SINCRONIZADO (Ejemplo de 1 minuto para pruebas)
const LESSON_TIMELINE: TimelineEvent[] = [
  {
    id: 'intro',
    startAt: 0,
    endAt: 10,
    title: '¡Welcome, chamo!',
    type: 'intro',
    content: 'Hoy vamos a dominar el arte de presentarnos en inglés. Es la base de todo.'
  },
  {
    id: 'vocab-1',
    startAt: 10,
    endAt: 25,
    title: 'Saludos Básicos',
    type: 'vocabulary',
    content: 'Repite conmigo en voz alta:',
    items: ['Hello! (¡Hola!)', 'Good morning (Buenos días)', 'Nice to meet you (Un placer)']
  },
  {
    id: 'grammar-1',
    startAt: 25,
    endAt: 45,
    title: 'El famoso Verb To Be',
    type: 'grammar',
    content: 'El verbo To Be significa "Ser" o "Estar". Depende del pronombre que uses:',
    items: ['I am -> Yo soy/estoy', 'You are -> Tú eres/estás', 'He is -> Él es/está']
  },
  {
    id: 'tip',
    startAt: 45,
    endAt: 60,
    title: 'Venezuelan Tip 🇻🇪',
    type: 'tip',
    content: 'En inglés no decimos "Tengo 20 años" (I have 20 years ❌). Decimos "Soy 20 años viejo" -> I am 20 years old ✅.'
  }
];

const Classroom: React.FC<Props> = ({ user, onExit, onCompleteModule }) => {
  const [videoTime, setVideoTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showExercisesBtn, setShowExercisesBtn] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Buscar qué evento debe mostrarse en este momento exacto
  const activeEvent = LESSON_TIMELINE.find(
    (event) => videoTime >= event.startAt && videoTime < event.endAt
  );

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setVideoTime(current);
      
      // Si el video está en el 95%, mostramos el botón para ir a la práctica
      if (current / videoDuration > 0.95 && !showExercisesBtn) {
        setShowExercisesBtn(true);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      
      {/* Header */}
      <nav className="flex items-center justify-between px-6 pt-12 pb-4 bg-white border-b border-slate-100 shrink-0 z-20 shadow-sm">
        <button onClick={onExit} className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform">
          <span className="material-icons">close</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-black text-primary tracking-widest">Módulo {user.currentModuleIndex + 1}</span>
          <span className="text-sm font-bold text-slate-800">{currModule.title}</span>
        </div>
        <div className="w-10"></div>
      </nav>

      {/* REPRODUCTOR DE VIDEO (Fijo arriba) */}
      <div className="relative w-full aspect-video bg-black shrink-0 shadow-xl z-10">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
          onEnded={() => setShowExercisesBtn(true)}
          // URL de un video de prueba genérico. Aquí iría el enlace a tu video de la clase.
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" 
          playsInline
        />
        
        {/* Controles superpuestos personalizados */}
        <div 
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
          onClick={togglePlay}
        >
          <button className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-sm transform hover:scale-105 transition-all">
            <span className="material-icons text-4xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
        </div>

        {/* Barra de progreso de video nativa/minimalista */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20">
          <div 
            className="h-full bg-primary transition-all duration-75"
            style={{ width: `${(videoTime / (videoDuration || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ÁREA DINÁMICA DE CONTENIDO (Cambia según el video) */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 relative">
        
        {/* Renderizado Condicional del Contenido Sincronizado */}
        {activeEvent ? (
          <div key={activeEvent.id} className="animate-in slide-in-from-bottom-8 fade-in duration-500">
            
            {/* Etiqueta de Tipo */}
            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm ${
              activeEvent.type === 'grammar' ? 'bg-blue-100 text-blue-700' :
              activeEvent.type === 'vocabulary' ? 'bg-green-100 text-green-700' :
              activeEvent.type === 'tip' ? 'bg-accent-yellow/20 text-accent-yellow' :
              'bg-slate-200 text-slate-700'
            }`}>
              {activeEvent.type}
            </div>

            {/* Título y Contenido */}
            <h2 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{activeEvent.title}</h2>
            <p className="text-slate-600 text-lg font-medium leading-relaxed mb-6">{activeEvent.content}</p>

            {/* Listas o Ejemplos dinámicos */}
            {activeEvent.items && (
              <div className="space-y-3">
                {activeEvent.items.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 animate-in fade-in zoom-in-95" style={{ animationDelay: `${i * 150}ms`, fillMode: 'both' }}>
                    <div className={`w-2 h-2 rounded-full ${activeEvent.type === 'grammar' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    <span className="font-bold text-slate-800 text-lg">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Estado Vacío / Esperando */
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
            <span className="material-icons text-4xl mb-2 animate-pulse">hearing</span>
            <p className="font-bold text-sm">Escucha con atención...</p>
          </div>
        )}

        {/* Botón para saltar a la práctica al final del video */}
        {showExercisesBtn && (
          <div className="absolute bottom-6 left-6 right-6 animate-in slide-in-from-bottom-4">
            <button 
              // Aquí iría tu función para cambiar el estado a 'exercises'
              onClick={() => alert('¡Pasando a los ejercicios!')} 
              className="w-full py-4 bg-accent-orange text-white font-black rounded-2xl shadow-xl shadow-accent-orange/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">star</span>
              ¡Iniciar Práctica Interactiva!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Classroom;