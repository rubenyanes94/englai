import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { type User, CEFRLevel, type LevelCurriculum } from '../types';

interface Props {
  user: User;
  onExit: () => void;
  onCompleteModule: () => void;
}

interface Question {
  text: string;
  options: string[];
  answer: string;
}

interface Exercise {
  type: 'multiple_choice' | 'fill_in_the_blank' | 'matching' | 'sentence_order';
  question: string;
  options?: string[];
  correctAnswer?: string;
  pairs?: { left: string; right: string }[];
  words?: string[];
}

type ClassroomTab = 'video' | 'practice' | 'exam';
type ClassroomState = 'watching' | 'practicing' | 'examining' | 'passed';

const CURRICULUMS: Record<CEFRLevel, LevelCurriculum> = {
  [CEFRLevel.A1]: {
    level: CEFRLevel.A1,
    title: "Acceso y Supervivencia",
    description: "Ideal para principiantes.",
    modules: [
      { id: '1', week: 1, title: "Presentaciones y Saludos", description: "Verbo To Be, pronombres y cortesía." },
      { id: '2', week: 2, title: "Números, Tiempo y Fechas", description: "Días de la semana, meses y contar." },
      { id: '3', week: 3, title: "Familia y Amigos", description: "Verbo To Be, pronombres y descripciones." },
      { id: '4', week: 4, title: "Rutinas Diarias", description: "Presente Simple." },
      { id: '5', week: 5, title: "Comida y Restaurantes", description: "Contables e incontables." },
      { id: '6', week: 6, title: "Lugares en la Ciudad", description: "Preposiciones de lugar." },
      { id: '7', week: 7, title: "Compras y Precios", description: "Money and shopping." },
      { id: '8', week: 8, title: "Clase de Certificación", description: "Final exam." },
    ]
  },
  [CEFRLevel.A2]: {
    level: CEFRLevel.A2,
    title: "Plataforma e Intercambio",
    description: "Mejora tu fluidez básica.",
    modules: [
      { id: '9', week: 1, title: "Experiencias Pasadas", description: "Pasado Simple: verbos regulares e irregulares." },
      { id: '10', week: 2, title: "Historias de Viaje", description: "Pasado Continuo y conectores temporales." },
      { id: '11', week: 3, title: "Comparaciones", description: "Más que, menos que y superlativos." },
      { id: '12', week: 4, title: "Salud y Bienestar", description: "Consejos y partes del cuerpo." },
      { id: '13', week: 5, title: "El Clima y la Naturaleza", description: "Vocabulario ambiental y predicciones." },
      { id: '14', week: 6, title: "Planes Futuros", description: "Going to vs Will." },
      { id: '15', week: 7, title: "Habilidades y Logros", description: "Can, Could y logros." },
      { id: '16', week: 8, title: "Clase de Certificación", description: "Examen final del nivel A2." },
    ]
  },
  [CEFRLevel.B1]: { level: CEFRLevel.B1, title: "Autonomía", description: "Nivel intermedio.", modules: [] },
  [CEFRLevel.B2]: { level: CEFRLevel.B2, title: "Avanzado", description: "Nivel intermedio alto.", modules: [] },
  [CEFRLevel.C1]: { level: CEFRLevel.C1, title: "Dominio", description: "Nivel avanzado.", modules: [] },
  [CEFRLevel.C2]: { level: CEFRLevel.C2, title: "Maestría", description: "Nivel nativo.", modules: [] },
};

// Utilidad para asegurar que leemos la clave correctamente en Vite
const getApiKey = () => {
  const key = import.meta.env.VITE_API_KEY;
  if (!key) {
    console.error("No se encontró VITE_API_KEY en el archivo .env");
    return null;
  }
  return key;
};

const Classroom: React.FC<Props> = ({ user, onExit, onCompleteModule }) => {
  const [activeTab, setActiveTab] = useState<ClassroomTab>('video');
  const [status, setStatus] = useState<ClassroomState>('watching');
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [matchingSelected, setMatchingSelected] = useState<{ left: string | null; right: string | null }>({ left: null, right: null });
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string; matched: boolean }[]>([]);
  
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentExamIdx, setCurrentExamIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [tutorImage, setTutorImage] = useState<string | null>(null);

  const currLevelData = CURRICULUMS[user.level];
  const currModule = currLevelData.modules[user.currentModuleIndex] || { title: "Evaluación", description: "Examen final" };

  useEffect(() => {
    // Usamos una imagen estática segura mientras configuras HeyGen o la API de imágenes
    setTutorImage("https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512");
    generateContent();
  }, [user.level, user.currentModuleIndex]);

  const generateContent = async () => {
    const key = getApiKey();
    if (!key) return;

    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        // CORRECCIÓN: Usar el modelo estándar y estable de Gemini
        model: 'gemini-2.5-flash',
        contents: `Genera el contenido para el Nivel ${user.level}, Módulo ${user.currentModuleIndex + 1}: "${currModule.title}". 
        Necesito:
        1. 3 ejercicios de práctica en un array llamado "exercises". El tipo debe ser 'multiple_choice' o 'fill_in_the_blank'.
        2. 3 preguntas de examen final en un array llamado "exam" con opciones y la respuesta correcta.
        Devuelve SOLO un JSON puro sin markdown con la estructura: { "exercises": [...], "exam": [...] }`,
        config: { responseMimeType: "application/json" }
      });
      
      const text = response.text || "{}";
      const data = JSON.parse(text);
      setExercises(data.exercises || []);
      setExamQuestions(data.exam || []);
    } catch (e) { 
      console.error("Error generando contenido con Gemini:", e); 
    } finally { 
      setIsTyping(false); 
    }
  };

  const handleVideoFinish = () => {
    setVideoProgress(100);
    setIsPlaying(false);
    alert("¡Excelente chamo! Terminaste la lección de 10 minutos. Ahora a practicar.");
    setActiveTab('practice');
    setStatus('practicing');
  };

  const nextExercise = () => {
    if (currentExerciseIdx < exercises.length - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
      setMatchingSelected({ left: null, right: null });
    } else {
      setActiveTab('exam');
      setStatus('examining');
    }
  };

  const handleExamAnswer = (ans: string) => {
    if (ans === examQuestions[currentExamIdx].answer) {
      if (currentExamIdx < examQuestions.length - 1) {
        setCurrentExamIdx(prev => prev + 1);
      } else {
        setStatus('passed');
      }
    } else {
      alert("¡Esa no es, chamo! Intenta de nuevo.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden w-full h-full max-w-md mx-auto relative shadow-2xl">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-xl z-50">
        <button onClick={onExit} className="p-2 bg-white/5 rounded-full text-white/60 active:scale-90 transition-all cursor-pointer">
          <span className="material-icons">close</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Certificación {user.level}</span>
          <h2 className="text-sm font-black text-white">{currModule.title}</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-accent-yellow/20 flex items-center justify-center border border-accent-yellow/30">
          <span className="text-accent-yellow font-black text-xs">{user.level}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-6 py-4 gap-2 bg-slate-900/50 z-40">
        {[
          { id: 'video', label: 'Lección Video', icon: 'play_circle' },
          { id: 'practice', label: 'Práctica', icon: 'psychology' },
          { id: 'exam', label: 'Certificación', icon: 'verified' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ClassroomTab)}
            className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all border-2 cursor-pointer ${
              activeTab === tab.id 
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
            }`}
          >
            <span className="material-icons text-xl">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <main className="flex-1 flex flex-col overflow-hidden bg-white rounded-t-[3rem] relative z-10">
        {/* TABS CONTENIDOS */}
        
        {/* TAB 1: VIDEO */}
        {activeTab === 'video' && (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl group">
              {tutorImage && <img src={tutorImage} alt="Tutor" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[10s]" />}
              <div className="absolute inset-0 flex items-center justify-center">
                {!isPlaying ? (
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-transform cursor-pointer"
                  >
                    <span className="material-icons text-white text-4xl ml-1">play_arrow</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-1 items-end h-8">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-2 bg-accent-yellow rounded-full animate-bounce" style={{ height: '100%', animationDelay: `${i * 0.1}s` }}></div>
                      ))}
                    </div>
                    <p className="text-white font-black text-xs uppercase tracking-[0.2em] animate-pulse">James está explicando...</p>
                  </div>
                )}
              </div>
              
              {/* Fake Progress Bar (10 Minutos) */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                <div className={`h-full bg-primary transition-all duration-[600s] ease-linear ${isPlaying ? 'w-full' : 'w-0'}`} onTransitionEnd={handleVideoFinish}></div>
              </div>

              <div className="absolute top-4 left-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">IA Nativa • 10:00 Min</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 leading-tight">Lección: {currModule.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                En esta clase de 10 minutos, el Profesor James te enseñará {currModule.description.toLowerCase()} con ejemplos prácticos adaptados al día a día. Presta atención a la pronunciación nativa.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enfoque</span>
                  <p className="text-xs font-black text-slate-800">Gramática Aplicada</p>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recurso</span>
                  <p className="text-xs font-black text-slate-800">Video PDF Guide</p>
                </div>
              </div>
            </div>

            {/* Este botón aparece al terminar la lección */}
            <button 
              onClick={() => { setActiveTab('practice'); setStatus('practicing'); }}
              className="w-full mt-auto py-5 bg-slate-900 text-white font-black rounded-[2rem] shadow-xl shadow-black/20 flex items-center justify-center gap-3 active:scale-95 transition-transform cursor-pointer"
            >
              <span>Ir a la Práctica Interactiva</span>
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>
        )}

        {/* TAB 2: PRÁCTICA */}
        {activeTab === 'practice' && (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
            {exercises.length > 0 ? (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-accent-orange uppercase tracking-[0.2em]">Práctica Interactiva</span>
                  <span className="text-xs font-black text-slate-300">{currentExerciseIdx + 1} / {exercises.length}</span>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-8 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-accent-orange opacity-10"></div>
                    <p className="text-lg font-black text-slate-800 leading-relaxed text-center">
                      {exercises[currentExerciseIdx].question}
                    </p>
                  </div>

                  <div className="space-y-3 mt-auto">
                    {exercises[currentExerciseIdx].type === 'multiple_choice' && exercises[currentExerciseIdx].options?.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          if (opt === exercises[currentExerciseIdx].correctAnswer) nextExercise();
                          else alert("¡Casi chamo! Intenta otra vez.");
                        }}
                        className="w-full p-5 text-left bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold text-slate-700 hover:border-accent-orange hover:bg-accent-orange/5 active:scale-95 transition-all flex justify-between items-center cursor-pointer"
                      >
                        <span>{opt}</span>
                        <span className="material-icons text-slate-100 group-hover:text-accent-orange">check_circle</span>
                      </button>
                    ))}

                    {exercises[currentExerciseIdx].type === 'fill_in_the_blank' && (
                      <div className="space-y-4">
                        <input 
                          type="text"
                          placeholder="Escribe tu respuesta..."
                          className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-center text-slate-800 focus:border-accent-orange focus:ring-0 outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if ((e.target as HTMLInputElement).value.toLowerCase().trim() === exercises[currentExerciseIdx].correctAnswer?.toLowerCase()) nextExercise();
                              else alert("Esa no es, ¡vuelve a intentarlo!");
                            }
                          }}
                        />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Presiona ENTER para enviar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Generando Práctica IA...</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXAMEN */}
        {activeTab === 'exam' && (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
            {status === 'passed' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-200 mb-6 relative">
                  <span className="material-icons text-white text-5xl">verified</span>
                  <div className="absolute -inset-2 rounded-full border-2 border-green-500 animate-ping opacity-25"></div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">¡Módulo Superado!</h2>
                <p className="text-sm text-slate-500 font-medium mb-10 max-w-xs">Increíble trabajo chamo. Has demostrado dominar los conceptos de {currModule.title}.</p>
                
                {/* CORRECCIÓN: Botón cerrado correctamente */}
                <button 
                  onClick={() => { onCompleteModule(); onExit(); }}
                  className="w-full py-5 bg-primary text-white font-black text-lg rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Siguiente Módulo</span>
                  <span className="material-icons">arrow_forward</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col animate-in slide-in-from-right-10">
                <header className="mb-10">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Examen de Certificación</span>
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900">{user.level} {currModule.title}</h3>
                    <span className="text-xs font-black text-slate-400">{currentExamIdx + 1} / {examQuestions.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentExamIdx + 1) / examQuestions.length) * 100}%` }}></div>
                  </div>
                </header>

                {examQuestions.length > 0 ? (
                  <div className="flex-1 flex flex-col">
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] mb-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                      <p className="text-lg font-bold leading-relaxed relative z-10 text-center">
                        {examQuestions[currentExamIdx].text}
                      </p>
                    </div>
                    
                    <div className="space-y-3 mt-auto">
                      {examQuestions[currentExamIdx].options.map((opt, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleExamAnswer(opt)}
                          className="w-full p-5 text-left bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold text-slate-700 hover:border-primary hover:bg-primary/5 active:scale-95 transition-all flex justify-between items-center cursor-pointer"
                        >
                          <span>{opt}</span>
                          <span className="material-icons text-slate-100 group-hover:text-primary">check_circle</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Preparando Examen...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Classroom;