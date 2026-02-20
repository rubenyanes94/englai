
import React from 'react';
import { type User, CEFRLevel } from '../types';

interface Props {
  user: User;
}

const ProgressMap: React.FC<Props> = ({ user }) => {
  const levels = [
    { code: CEFRLevel.C2, name: 'C2 - Maestría', desc: 'Dominio total y natural del idioma.', locked: true },
    { code: CEFRLevel.C1, name: 'C1 - Avanzado', desc: 'Temas complejos y matices implícitos.', locked: true },
    { code: CEFRLevel.B2, name: 'B2 - Intermedio Alto', desc: 'Interacción fluida con nativos.', isTarget: true },
    { code: CEFRLevel.B1, name: 'B1 - Intermedio', desc: 'Desenvolvimiento en viajes y trabajo.', completed: true },
    { code: CEFRLevel.A2, name: 'A2 - Básico', desc: 'Frases de uso cotidiano inmediato.', completed: true },
    { code: CEFRLevel.A1, name: 'A1 - Acceso', desc: 'Expresiones básicas de supervivencia.', completed: true },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <header className="mt-12 px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              alt="User profile" 
              className="w-14 h-14 rounded-full border-2 border-primary/20 object-cover" 
              src="https://picsum.photos/seed/user123/100/100" 
            />
            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              {user.level}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">¡Hola, Chamo! 👋</h1>
            <p className="text-sm text-primary font-semibold">Ruta hacia el nivel B2</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
          <span className="material-icons">notifications</span>
        </button>
      </header>

      <section className="px-6 mb-10">
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900">Habilidades CEFR</h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">PROMEDIO: 48%</span>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {[
              { icon: 'headset', label: 'Listening', value: 65 },
              { icon: 'mic', label: 'Speaking', value: 42 },
              { icon: 'menu_book', label: 'Reading', value: 78 },
              { icon: 'edit', label: 'Writing', value: 35 },
            ].map((skill, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className="material-icons text-primary text-sm">{skill.icon}</span> {skill.label}
                  </span>
                  <span className="text-primary">{skill.value}%</span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${skill.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6">
        <h2 className="font-bold text-lg mb-8 text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">route</span>
          Mapa de Progreso MCER
        </h2>
        
        <div className="relative pl-10">
          <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-full bg-primary absolute bottom-0 h-[40%] rounded-full"></div>
          </div>

          {levels.map((lvl, i) => (
            <div key={i} className={`relative mb-12 ${lvl.locked ? 'opacity-40' : ''}`}>
              <div className={`absolute -left-[31px] top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center border-4 border-white shadow-sm ${lvl.completed ? 'bg-primary' : lvl.isTarget ? 'bg-white border-primary/30' : 'bg-white border-slate-300'}`}>
                {lvl.completed ? (
                  <span className="material-icons text-[12px] text-white">check</span>
                ) : lvl.isTarget ? (
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                ) : null}
              </div>
              
              {lvl.isTarget ? (
                <div className="bg-primary/5 border border-primary/10 p-5 rounded-3xl -ml-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-primary">{lvl.name}</h3>
                    <span className="bg-primary text-[9px] px-2 py-0.5 rounded-full text-white font-bold uppercase tracking-wider">Meta</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">{lvl.desc}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm">🤖</div>
                      <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm">✍️</div>
                    </div>
                    <span className="text-[10px] text-primary font-bold">Faltan 14 sesiones AI</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold ${lvl.completed ? 'text-slate-900' : 'text-slate-500'}`}>{lvl.name}</h3>
                    {lvl.locked ? <span className="material-icons text-slate-400 text-sm">lock</span> : lvl.completed ? <span className="material-icons text-primary text-lg">verified</span> : null}
                  </div>
                  <p className="text-xs text-slate-500">{lvl.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProgressMap;
