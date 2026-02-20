import React, { useState } from 'react';
import { CEFRLevel, type LevelCurriculum } from '../types';

interface Props {
  onBack: () => void;
  onConfirm: (level: CEFRLevel) => void;
}

const CurriculumView: React.FC<Props> = ({ onBack, onConfirm }) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);

  const curriculums: LevelCurriculum[] = [
    {
      level: CEFRLevel.A1,
      title: "Acceso y Supervivencia",
      description: "Ideal para principiantes. Aprende a presentarte y comunicarte en situaciones básicas.",
      modules: [
        { id: '1', week: 1, title: "Presentaciones y Saludos", description: "Verbo To Be, pronombres y cortesía." },
        { id: '2', week: 2, title: "Números, Tiempo y Fechas", description: "Días de la semana, meses y contar." },
        { id: '3', week: 3, title: "Familia y Amigos", description: "Adjetivos posesivos y descripciones físicas." },
        { id: '4', week: 4, title: "Rutinas Diarias", description: "Presente Simple y adverbios de frecuencia." },
        { id: '5', week: 5, title: "Comida y Restaurantes", description: "Sustantivos contables e incontables." },
        { id: '6', week: 6, title: "Lugares en la Ciudad", description: "Preposiciones de lugar y direcciones." },
        { id: '7', week: 7, title: "Compras y Precios", description: "This, That, These, Those y dinero." },
        { id: '8', week: 8, title: "Clase de Certificación", description: "Repaso general y examen A1." },
      ]
    },
    {
      level: CEFRLevel.A2,
      title: "Plataforma e Intercambio",
      description: "Mejora tu fluidez básica y describe tu pasado y planes futuros.",
      modules: [
        { id: '9', week: 1, title: "Experiencias Pasadas", description: "Pasado Simple: verbos regulares e irregulares." },
        { id: '10', week: 2, title: "Historias de Viaje", description: "Pasado Continuo y conectores temporales." },
        { id: '11', week: 3, title: "Comparaciones", description: "Comparativos y superlativos." },
        { id: '12', week: 4, title: "Salud y Bienestar", description: "Modal verbs: Should, Must, Have to." },
        { id: '13', week: 5, title: "El Clima y la Naturaleza", description: "Vocabulario ambiental y predicciones." },
        { id: '14', week: 6, title: "Planes Futuros", description: "Going to vs Will." },
        { id: '15', week: 7, title: "Habilidades y Logros", description: "Can, Could, Be able to." },
        { id: '16', week: 8, title: "Clase de Certificación", description: "Repaso general y examen A2." },
      ]
    },
    {
      level: CEFRLevel.B1,
      title: "Umbral de Autonomía",
      description: "Desenruédate en el trabajo y viajes largos con confianza.",
      modules: [
        { id: '17', week: 1, title: "Vida Profesional", description: "Presente Perfecto Simple." },
        { id: '18', week: 2, title: "Noticias y Medios", description: "Voz Pasiva básica." },
        { id: '19', week: 3, title: "Deseos e Hipótesis", description: "Primer condicional." },
        { id: '20', week: 4, title: "Relaciones Sociales", description: "Verbos seguidos de gerundio o infinitivo." },
        { id: '21', week: 5, title: "Cultura y Arte", description: "Relative clauses." },
        { id: '22', week: 6, title: "Opiniones y Debates", description: "Phrasal verbs comunes." },
        { id: '23', week: 7, title: "Costumbres Mundiales", description: "Used to / Would." },
        { id: '24', week: 8, title: "Clase de Certificación", description: "Repaso general y examen B1." },
      ]
    }
    // Add B2, C1, C2 similarly...
  ];

  const currentCurriculum = curriculums.find(c => c.level === selectedLevel) || curriculums[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <header className="px-6 pt-12 pb-6 bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-90 transition-transform">
            <span className="material-icons">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Plan de Estudios</h1>
            <p className="text-xs text-primary font-bold uppercase tracking-wider">Metodología 8 Semanas</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {Object.values(CEFRLevel).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                selectedLevel === lvl 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-white text-slate-400 border-slate-100'
              }`}
            >
              Nivel {lvl}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-accent-yellow text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">PLAN 2 MESES</span>
              <span className="text-primary material-icons text-sm">verified</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">{currentCurriculum.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{currentCurriculum.description}</p>
          </div>
        </section>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Ruta de Módulos</h3>
          {currentCurriculum.modules.map((mod, idx) => (
            <div key={mod.id} className="relative pl-12">
              {/* Connecting Line */}
              {idx !== currentCurriculum.modules.length - 1 && (
                <div className="absolute left-[20px] top-10 bottom-[-16px] w-0.5 bg-slate-200"></div>
              )}
              
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm z-10">
                <span className="text-[10px] font-bold text-primary">W{mod.week}</span>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group active:bg-slate-50 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-slate-800">{mod.title}</h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Semana {mod.week}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{mod.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 pb-24">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 mb-6">
            <span className="material-icons text-primary text-xl">timer</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Compromiso:</strong> Este nivel está diseñado para ser completado en <strong>8 semanas</strong> (2 meses) dedicando al menos 3 sesiones AI semanales de 30 minutos.
            </p>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 w-full px-6 pb-10 pt-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-40">
        <button 
          onClick={() => onConfirm(selectedLevel)}
          className="w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/25 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Iniciar Nivel {selectedLevel}</span>
          <span className="material-icons">rocket_launch</span>
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CurriculumView;
