import React from 'react';
import { CEFRLevel } from '../types';

interface Props {
  onStart: () => void;
  onLogin: () => void;
  onPlacementTest: () => void;
}

const LandingPage: React.FC<Props> = ({ onStart, onLogin, onPlacementTest }) => {
  const levels = [
    { code: CEFRLevel.A1, name: 'Acceso', desc: 'Frases básicas y supervivencia.' },
    { code: CEFRLevel.A2, name: 'Plataforma', desc: 'Intercambio directo de información.' },
    { code: CEFRLevel.B1, name: 'Umbral', desc: 'Autonomía en viajes y deseos.' },
    { code: CEFRLevel.B2, name: 'Avanzado', desc: 'Entendimiento de ideas complejas.' },
    { code: CEFRLevel.C1, name: 'Dominio', desc: 'Uso flexible para fines sociales.' },
    { code: CEFRLevel.C2, name: 'Maestría', desc: 'Comprensión total con facilidad.' },
  ];

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden pb-12 bg-white">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 via-white to-transparent -z-10"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-yellow/10 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Nav-like Header */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 transform -rotate-3">
            <span className="text-white font-black text-2xl">V</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-slate-900 leading-none">Vene-English</span>
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Academy</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global • MCER</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-8 pt-6 pb-6 text-center space-y-5 z-10 shrink-0">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full shadow-sm">
          <span className="material-icons text-primary text-[14px]">stars</span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profesores Nativos de IA</span>
        </div>
        <h1 className="text-[36px] font-black tracking-tighter leading-[1.1] text-slate-900">
          Domina el Inglés de <br/>
          <span className="text-primary">A1 a C2</span> en tiempo récord
        </h1>
        <p className="text-slate-500 text-[15px] leading-relaxed max-w-[320px] mx-auto font-medium">
          La única academia diseñada por y para venezolanos. Prepárate para el éxito internacional con James, tu tutor personal.
        </p>
      </div>

      {/* Level Grid Section */}
      <div className="z-10 px-6 py-6 space-y-5">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Ruta de Certificación</h2>
          <span className="text-[10px] font-bold text-primary">8 Semanas/Nivel</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {levels.map((lvl) => (
            <div key={lvl.code} className="group bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all active:scale-[0.97]">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <span className="text-primary font-black text-sm">{lvl.code}</span>
                </div>
                <span className="material-icons text-slate-200 text-[18px] group-hover:text-primary transition-colors">arrow_outward</span>
              </div>
              <h3 className="text-xs font-black text-slate-800 mb-1">{lvl.name}</h3>
              <p className="text-[10px] text-slate-400 leading-tight font-medium line-clamp-2">{lvl.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="px-8 mt-6 space-y-3 z-10 sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-10 pb-4">
        <button 
          onClick={onStart}
          className="w-full py-5 bg-primary text-white font-black text-base rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <span className="material-icons">rocket_launch</span>
          Explorar Plan de Estudios
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onPlacementTest}
            className="py-4 bg-accent-yellow text-slate-900 font-black text-sm rounded-2xl shadow-lg shadow-accent-yellow/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-b-4 border-black/10"
          >
            <span className="material-icons text-[18px]">quiz</span>
            Nivelación
          </button>

          <button 
            onClick={onLogin}
            className="py-4 bg-slate-900 text-white font-black text-sm rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons text-[18px]">login</span>
            Ingresar
          </button>
        </div>

        <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] pt-4">
          Vene-English Academy © 2025
        </p>
      </div>

      {/* Bottom Accent Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1.5 bg-primary z-30 opacity-90 shadow-[0_-4px_10px_rgba(19,127,236,0.3)]"></div>
    </div>
  );
};

export default LandingPage;
