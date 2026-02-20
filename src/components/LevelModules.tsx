
import React from 'react';
import { type User, CEFRLevel } from '../types';
import type { LevelCurriculum } from '../types';

interface Props {
  user: User;
  onBack: () => void;
  onStartModule: () => void;
}

const CURRICULUMS: Record<CEFRLevel, LevelCurriculum> = {
  [CEFRLevel.A1]: {
    level: CEFRLevel.A1,
    title: "Nivel A1: Principiante",
    description: "Inicia tu camino en el inglés desde cero.",
    modules: [
      { id: '1', week: 1, title: "Presentaciones", description: "Saludos básicos y el verbo To Be." },
      { id: '2', week: 2, title: "Números y Tiempo", description: "Cómo decir la hora y fechas." },
      { id: '3', week: 3, title: "Familia", description: "Vocabulario de parientes y posesivos." },
      { id: '4', week: 4, title: "Rutinas", description: "Presente simple y hábitos." },
      { id: '5', week: 5, title: "Comida", description: "Restaurantes y compras." },
      { id: '6', week: 6, title: "Ciudad", description: "Direcciones y lugares." },
      { id: '7', week: 7, title: "Clima", description: "Estaciones y vestimenta." },
      { id: '8', week: 8, title: "Certificación", description: "Examen final del nivel A1." },
    ]
  },
  [CEFRLevel.A2]: {
    level: CEFRLevel.A2,
    title: "Nivel A2: Elemental",
    description: "Aprende a describir tu pasado y hacer planes futuros.",
    modules: [
      { id: '9', week: 1, title: "Experiencias Pasadas", description: "Pasado simple y verbos irregulares." },
      { id: '10', week: 2, title: "Historias de Viaje", description: "Pasado continuo y anécdotas." },
      { id: '11', week: 3, title: "Comparaciones", description: "Más que, menos que y superlativos." },
      { id: '12', week: 4, title: "Salud", description: "Consejos y partes del cuerpo." },
      { id: '13', week: 5, title: "Naturaleza", description: "El mundo que nos rodea." },
      { id: '14', week: 6, title: "Planes Futuros", description: "Going to vs Will." },
      { id: '15', week: 7, title: "Habilidades", description: "Can, Could y logros." },
      { id: '16', week: 8, title: "Certificación", description: "Examen final del nivel A2." },
    ]
  },
  // Otros niveles se completarían de igual forma
  [CEFRLevel.B1]: { level: CEFRLevel.B1, title: "Nivel B1: Intermedio", description: "", modules: [] },
  [CEFRLevel.B2]: { level: CEFRLevel.B2, title: "Nivel B2: Intermedio Alto", description: "", modules: [] },
  [CEFRLevel.C1]: { level: CEFRLevel.C1, title: "Nivel C1: Avanzado", description: "", modules: [] },
  [CEFRLevel.C2]: { level: CEFRLevel.C2, title: "Nivel C2: Maestro", description: "", modules: [] },
};

const LevelModules: React.FC<Props> = ({ user, onBack, onStartModule }) => {
  const curriculum = CURRICULUMS[user.level] || CURRICULUMS[CEFRLevel.A1];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <header className="px-6 pt-12 pb-6 bg-white border-b border-slate-100 flex items-center gap-4 sticky top-0 z-30">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-90 transition-transform shadow-sm">
          <span className="material-icons">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Módulos {user.level}</h1>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Tu Ruta de Aprendizaje</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8 pb-32">
        <section className="bg-primary p-6 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-1">{curriculum.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">{curriculum.description}</p>
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-yellow rounded-xl flex items-center justify-center shadow-lg">
                  <span className="material-icons text-slate-900">trending_up</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-70">Progreso Total</p>
                  <p className="text-lg font-black">{user.progress}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase opacity-70">Módulo Actual</p>
                <p className="text-lg font-black">{user.currentModuleIndex + 1} / 8</p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Listado de Módulos</h3>
          {curriculum.modules.map((mod, idx) => {
            const isCompleted = idx < user.currentModuleIndex;
            const isCurrent = idx === user.currentModuleIndex;
            const isLocked = idx > user.currentModuleIndex;

            return (
              <div key={mod.id} className="relative pl-12">
                {/* Connector line */}
                {idx !== curriculum.modules.length - 1 && (
                  <div className={`absolute left-[19px] top-10 bottom-[-16px] w-0.5 ${isCompleted ? 'bg-primary' : 'bg-slate-200'}`}></div>
                )}
                
                {/* Status Dot */}
                <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-10 transition-all border-4 border-white ${
                  isCompleted ? 'bg-primary' : isCurrent ? 'bg-white border-primary animate-pulse' : 'bg-slate-100'
                }`}>
                  {isCompleted ? (
                    <span className="material-icons text-white text-base font-bold">check</span>
                  ) : isLocked ? (
                    <span className="material-icons text-slate-300 text-sm">lock</span>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                  )}
                </div>
                
                {/* Module Card */}
                <div 
                  onClick={() => isCurrent && onStartModule()}
                  className={`p-5 rounded-3xl border transition-all ${
                    isCurrent 
                    ? 'bg-white border-primary/30 shadow-md ring-1 ring-primary/5 active:scale-[0.98] cursor-pointer' 
                    : isCompleted 
                    ? 'bg-white border-slate-100 opacity-80' 
                    : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-black text-base ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                      {mod.title}
                    </h4>
                    {isCurrent && (
                      <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        ¡Ahora!
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${isLocked ? 'text-slate-300' : 'text-slate-500'}`}>
                    {mod.description}
                  </p>
                  
                  {isCurrent && (
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-primary text-sm">play_circle</span>
                        <span className="text-[10px] font-black text-primary uppercase">Continuar clase</span>
                      </div>
                      <span className="material-icons text-primary text-lg">arrow_forward</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Persistent Start Button for current module */}
      <div className="absolute bottom-0 w-full px-6 pb-10 pt-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent z-40">
        <button 
          onClick={onStartModule}
          className="w-full py-5 bg-primary text-white font-black text-lg rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-[0.97] transition-all flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-white text-2xl font-bold">smart_toy</span>
          <span>Entrar al Módulo {user.currentModuleIndex + 1}</span>
        </button>
      </div>
    </div>
  );
};

export default LevelModules;
