import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { type User, CEFRLevel, type LevelCurriculum } from '../types';

interface Props {
  user: User;
  onExit: () => void;
  onCompleteModule: () => void;
  onUpdateUser: (updatedFields: Partial<User>) => void;
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

const getApiKey = () => {
  const key = import.meta.env.VITE_API_KEY;
  if (!key || key.trim() === '') {
    console.error("API_KEY no encontrada en las variables de entorno de Vite (.env).");
    return null;
  }
  return key.trim();
};

const Classroom: React.FC<Props> = ({ user, onExit, onCompleteModule, onUpdateUser }) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(user.currentModuleIndex);

  const [activeTab, setActiveTab] = useState<ClassroomTab>('video');
  const [status, setStatus] = useState<ClassroomState>('watching');
  const [videoSeconds, setVideoSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keyError, setKeyError] = useState(false);
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentExamIdx, setCurrentExamIdx] = useState(0);
  const [tutorImage, setTutorImage] = useState<string | null>(null);

  const currLevelData = CURRICULUMS[user.level];
  const totalModules = currLevelData.modules.length;
  const currModule = currLevelData.modules[activeModuleIndex] || { title: "Evaluación", description: "Examen final" };

  useEffect(() => {
    let interval: number;
    if (isPlaying && videoSeconds < 600) {
      interval = window.setInterval(() => {
        setVideoSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, videoSeconds]);

  useEffect(() => {
    if (videoSeconds >= 600) {
      handleVideoFinish();
    }
  }, [videoSeconds]);

  useEffect(() => {
    const key = getApiKey();
    if (!key) {
      setKeyError(true);
      setTutorImage("[https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512](https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512)");
      return;
    }
    setKeyError(false);

    // Vaciamos los estados antes de generar para forzar la pantalla de "Cargando..."
    setExercises([]);
    setExamQuestions([]);

    generateTutorImage(key);
    generateContent(key);
    
    setVideoSeconds(0);
    setIsPlaying(false);
    setStatus('watching');
    setActiveTab('video');
    setCurrentExerciseIdx(0);
    setCurrentExamIdx(0);
  }, [user.level, activeModuleIndex]);

  const generateTutorImage = async (apiKey: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey });
      await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: "Devuelve solo esta URL de avatar: [https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512](https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512)",
      });
      setTutorImage("[https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512](https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512)");
    } catch (e) { 
      setTutorImage("[https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512](https://ui-avatars.com/api/?name=Profesor+James&background=137fec&color=fff&size=512)");
    }
  };

  // --- CORRECCIÓN CLAVE AQUÍ ---
  const generateContent = async (apiKey: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Genera contenido educativo para aprender inglés. Nivel ${user.level}, Módulo ${activeModuleIndex + 1}: "${currModule.title}". 
        Devuelve SOLO un objeto JSON con dos arreglos:
        1. "exercises" (3 items): Objetos con "type" ("multiple_choice" o "fill_in_the_blank"), "question", "options" (solo si es multiple_choice), "correctAnswer".
        2. "exam" (3 items): Objetos con "text" (la pregunta), "options" (arreglo), "answer" (respuesta correcta).
        Importante: Devuelve un JSON limpio, sin bloques de código markdown ni etiquetas.`,
        config: { responseMimeType: "application/json" }
      });

      // Limpiamos el texto por si la IA devuelve ```json ... ```
      let rawText = response.text || "{}";
      rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();

      const data = JSON.parse(rawText);
      
      if (data.exercises && data.exercises.length > 0) {
        setExercises(data.exercises);
      } else {
        throw new Error("No exercises array found in JSON");
      }

      if (data.exam && data.exam.length > 0) {
        setExamQuestions(data.exam);
      } else {
        throw new Error("No exam array found in JSON");
      }

    } catch (e) { 
      console.error("Error al generar contenido, cargando respaldo:", e); 
      // FALLBACK: Si hay un error, cargamos contenido base para no bloquear al usuario
      setExercises([
        { type: 'multiple_choice', question: 'Choose the correct form of the verb "to be" for "I":', options: ['am', 'is', 'are'], correctAnswer: 'am' },
        { type: 'fill_in_the_blank', question: 'She ___ a doctor.', correctAnswer: 'is' },
        { type: 'multiple_choice', question: 'What is the correct translation for "Hola"?', options: ['Hello', 'Goodbye', 'Please'], correctAnswer: 'Hello' }
      ]);
      setExamQuestions([
        { text: 'Which pronoun is used for a male?', options: ['He', 'She', 'It'], answer: 'He' },
        { text: 'Select the plural of "apple":', options: ['apples', 'apple', 'applies'], answer: 'apples' },
        { text: 'How do you say "Gracias"?', options: ['Thank you', 'Please', 'Sorry'], answer: 'Thank you' }
      ]);
    }
  };

  const handleVideoFinish = () => {
    setIsPlaying(false);
    alert("¡Excelente chamo! Terminaste la lección. Ahora a practicar.");
    setActiveTab('practice');
    setStatus('practicing');
  };

  const nextExercise = () => {
    if (currentExerciseIdx < exercises.length - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
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

  const goToPrevModule = () => {
    if (activeModuleIndex > 0) {
      const prevIdx = activeModuleIndex - 1;
      setActiveModuleIndex(prevIdx);
      onUpdateUser({ currentModuleIndex: prevIdx });
    }
  };

  const goToNextModule = () => {
    if (activeModuleIndex < totalModules - 1) {
      const nextIdx = activeModuleIndex + 1;
      setActiveModuleIndex(nextIdx);
      onUpdateUser({ currentModuleIndex: nextIdx });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
      
      {keyError && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white p-3 z-[200] text-center text-xs font-bold shadow-lg">
          ⚠️ Faltan permisos de IA. Revisa VITE_API_KEY en tu .env
        </div>
      )}

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-xl z-50">
        <button onClick={onExit} className="p-2 bg-white/5 rounded-full text-white/60 active:scale-90 transition-all cursor-pointer">
          <span className="material-icons">close</span>
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
             <button 
               onClick={goToPrevModule} 
               disabled={activeModuleIndex === 0}
               className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${activeModuleIndex === 0 ? 'bg-white/5 text-white/10' : 'bg-primary/20 text-primary active:scale-90'}`}
             >
               <span className="material-icons text-sm">chevron_left</span>
             </button>
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Módulo {activeModuleIndex + 1} de {totalModules}</span>
             <button 
               onClick={goToNextModule}
               disabled={activeModuleIndex === totalModules - 1}
               className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${activeModuleIndex === totalModules - 1 ? 'bg-white/5 text-white/10' : 'bg-primary/20 text-primary active:scale-90'}`}
             >
               <span className="material-icons text-sm">chevron_right</span>
             </button>
          </div>
          <h2 className="text-sm font-black text-white">{currModule.title}</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-accent-yellow/20 flex items-center justify-center border border-accent-yellow/30">
          <span className="text-accent-yellow font-black text-xs">{user.level}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-6 py-4 gap-2 bg-slate-900/50 relative z-40">
        {[
          { id: 'video', label: 'Lección', icon: 'play_circle' },
          { id: 'practice', label: 'Práctica', icon: 'psychology' },
          { id: 'exam', label: 'Examen', icon: 'verified' },
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

      <main className="flex-1 flex flex-col overflow-hidden bg-white rounded-t-[3rem] relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        
        {/* TAB 1: VIDEO */}
        {activeTab === 'video' && (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
            <div 
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl group cursor-pointer"
            >
              {tutorImage && <img src={tutorImage} alt="James Tutor" className={`w-full h-full object-cover transition-all duration-[20s] ease-linear ${isPlaying ? 'scale-110 opacity-70' : 'scale-100 opacity-40'}`} />}
              
              <div className="absolute inset-0 flex items-center justify-center">
                {!isPlaying ? (
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-transform">
                    <span className="material-icons text-white text-3xl ml-1">play_arrow</span>
                  </div>
                ) : (
                  <div className="absolute top-4 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 active:scale-90 transition-all opacity-0 group-hover:opacity-100">
                    <span className="material-icons text-lg">pause</span>
                  </div>
                )}
                
                {isPlaying && (
                  <div className="flex gap-1 items-end h-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1.5 bg-accent-yellow rounded-full animate-bounce" style={{ height: '100%', animationDelay: `${i * 0.15}s` }}></div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(videoSeconds / 600) * 100}%` }}></div>
              </div>

              <div className="absolute bottom-4 left-6 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg">
                <span className="text-[10px] font-black text-white font-mono tracking-widest">{formatTime(videoSeconds)} / 10:00</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 leading-tight">{currModule.title}</h3>
                <div className="flex gap-1">
                   <button onClick={goToPrevModule} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 cursor-pointer"><span className="material-icons text-sm">skip_previous</span></button>
                   <button onClick={goToNextModule} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 cursor-pointer"><span className="material-icons text-sm">skip_next</span></button>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                James te explica {currModule.description.toLowerCase()}. Haz click sobre el video para pausar o reanudar.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <p className="text-[10px] font-black text-slate-800 uppercase">{isPlaying ? 'Reproduciendo' : 'En Pausa'}</p>
                  </div>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Lección</span>
                  <p className="text-[10px] font-black text-slate-800 uppercase">{formatTime(600 - videoSeconds)} restante</p>
                </div>
              </div>
            </div>

            {videoSeconds >= 600 && (
              <button 
                onClick={() => { setActiveTab('practice'); setStatus('practicing'); }}
                className="w-full mt-auto py-5 bg-slate-900 text-white font-black rounded-[2rem] shadow-xl shadow-black/20 flex items-center justify-center gap-3 animate-in slide-in-from-bottom-4 cursor-pointer active:scale-95 transition-all"
              >
                <span>Siguiente: Práctica</span>
                <span className="material-icons">arrow_forward</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: PRÁCTICA */}
        {activeTab === 'practice' && (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
            {exercises.length > 0 ? (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-accent-orange uppercase tracking-[0.2em]">Práctica</span>
                  <span className="text-xs font-black text-slate-300">{currentExerciseIdx + 1} / {exercises.length}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center text-center">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-8 shadow-inner relative">
                    <p className="text-lg font-black text-slate-800 leading-relaxed">{exercises[currentExerciseIdx].question}</p>
                  </div>
                  <div className="space-y-3">
                    {exercises[currentExerciseIdx].options?.map((opt, i) => (
                      <button key={i} onClick={() => opt === exercises[currentExerciseIdx].correctAnswer ? nextExercise() : alert("¡Casi chamo! Esa no es.")}
                        className="w-full p-5 text-left bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold text-slate-700 hover:border-accent-orange hover:bg-accent-orange/5 active:scale-95 transition-all flex justify-between items-center cursor-pointer"
                      >
                        <span>{opt}</span>
                        <span className="material-icons text-slate-100">check_circle</span>
                      </button>
                    ))}
                    {exercises[currentExerciseIdx].type === 'fill_in_the_blank' && (
                       <div className="flex flex-col gap-2">
                         <input type="text" placeholder="Escribe tu respuesta..." className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-center text-slate-800 outline-none" onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).value.toLowerCase().trim() === exercises[currentExerciseIdx].correctAnswer?.toLowerCase() ? nextExercise() : alert("Intenta de nuevo, chequea la ortografía."); }} />
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Presiona Enter para validar</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cargando ejercicios...</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXAMEN */}
        {activeTab === 'exam' && (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
            {status === 'passed' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-200 mb-6">
                  <span className="material-icons text-white text-5xl">verified</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">¡Módulo Superado!</h2>
                
                {activeModuleIndex < totalModules - 1 ? (
                  <button 
                    onClick={() => { onCompleteModule(); goToNextModule(); }} 
                    className="w-full py-5 bg-primary text-white font-black text-lg rounded-[2rem] shadow-2xl active:scale-95 transition-all mt-8 cursor-pointer"
                  >
                    Siguiente Módulo
                  </button>
                ) : (
                  <button 
                    onClick={() => { onCompleteModule(); onExit(); }} 
                    className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-[2rem] shadow-2xl active:scale-95 transition-all mt-8 cursor-pointer"
                  >
                    Finalizar Nivel
                  </button>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col animate-in slide-in-from-right-10">
                <header className="mb-10">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Examen de Certificación</span>
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900">Evaluación {user.level}</h3>
                    <span className="text-xs font-black text-slate-400">{currentExamIdx + 1} / {examQuestions.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentExamIdx + 1) / examQuestions.length) * 100}%` }}></div>
                  </div>
                </header>
                {examQuestions.length > 0 ? (
                  <div className="flex-1 flex flex-col">
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] mb-8 shadow-2xl">
                      <p className="text-lg font-bold leading-relaxed">{examQuestions[currentExamIdx].text}</p>
                    </div>
                    <div className="space-y-3">
                      {examQuestions[currentExamIdx].options.map((opt, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleExamAnswer(opt)} 
                          className="w-full p-5 text-left bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold text-slate-700 hover:border-primary active:scale-95 transition-all cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">Generando prueba...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Nav Hint */}
      <div className="px-6 py-4 flex justify-between items-center bg-slate-900 text-white/40 text-[8px] font-black uppercase tracking-[0.3em]">
        <span>James Academy © 2025</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <span>Sesión Segura</span>
        </div>
      </div>
    </div>
  );
};

export default Classroom;