import React from 'react';
import { type User } from '../types';

interface Props {
  user: User;
  onJoinClass: () => void;
  onShowModules: () => void;
}

const Dashboard: React.FC<Props> = ({ user, onJoinClass, onShowModules }) => {
  return (
    <div className="flex-1 flex flex-col pb-28 overflow-y-auto bg-slate-50/50">
      <header className="px-6 pt-14 pb-8 flex justify-between items-center bg-white border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent-yellow rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img 
              alt="Profile" 
              className="relative w-14 h-14 rounded-full border-2 border-white object-cover shadow-sm" 
              src="https://picsum.photos/seed/miguel_v/100/100" 
            />
            <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">Bienvenido de vuelta</p>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">¡Hola, {user.name}!</h1>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-accent-orange/10 px-3 py-1.5 rounded-2xl border border-accent-orange/20 shadow-sm animate-bounce-subtle">
            <span className="material-icons text-accent-orange text-lg">local_fire_department</span>
            <span className="font-black text-accent-orange text-sm">{user.streak} días</span>
          </div>
        </div>
      </header>

      <main className="px-6 pt-6 space-y-8">
        {/* Main Progress Card */}
        <section 
          onClick={onShowModules}
          className="bg-primary rounded-[2.5rem] p-7 text-white shadow-2xl shadow-primary/30 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          {/* Abstract decor */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-yellow/10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">Tu Meta Actual</span>
              <h2 className="text-3xl font-black mt-3 mb-1">Nivel {user.level}</h2>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Certificación MCER</p>
            </div>
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20">
                <circle className="text-white/15" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" stroke-width="6"></circle>
                <circle className="text-white" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" stroke-dasharray="213.63" stroke-dashoffset={213.63 * (1 - user.progress / 100)} stroke-linecap="round" stroke-width="6" transform="rotate(-90 40 40)"></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-sm font-black leading-none">{user.progress}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between relative z-10">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px]">✓</div>
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              Ver módulos <span className="material-icons text-sm">chevron_right</span>
            </span>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-icons text-xl">translate</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{user.wordsLearned}</p>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Palabras</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-icons text-xl">insights</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{user.practiceHours}h</p>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Práctica</p>
            </div>
          </div>
        </section>

        {/* Next Lesson Card */}
        <section className="pb-4">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Siguiente Sesión AI</h3>
            <span className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-green-600 uppercase">James está listo</span>
            </span>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm overflow-hidden relative group active:scale-[0.98] transition-all">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
            
            <div className="flex items-center gap-5 mb-6 relative z-10">
              <div className="relative">
                <img 
                  alt="James AI Tutor" 
                  className="w-20 h-20 rounded-[2rem] object-cover shadow-lg border border-slate-50" 
                  src="https://picsum.photos/seed/james_ai/120/120" 
                />
                <div className="absolute -bottom-1 -right-1 bg-slate-900 text-[8px] font-black px-2 py-1 rounded-lg text-white shadow-xl tracking-tighter uppercase">Native AI</div>
              </div>
              <div>
                <h4 className="font-black text-xl text-slate-900 leading-tight">Profesor James</h4>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Módulo {user.currentModuleIndex + 1} de 8</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[9px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-black text-slate-500 uppercase">24/7 Disponible</span>
                  <span className="text-[9px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-black text-slate-500 uppercase">Voz y Video</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onJoinClass}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-black/20 flex items-center justify-center gap-3 transition-all relative z-10"
            >
              <span className="material-symbols-outlined text-white text-2xl">smart_toy</span>
              <span className="text-base">Continuar mi clase</span>
            </button>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
