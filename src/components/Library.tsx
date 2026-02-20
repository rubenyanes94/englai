
import React from 'react';

const Library: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Biblioteca Práctica</h1>
            <p className="text-slate-500 text-sm">Recursos para venezolanos</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="material-icons text-primary text-xl">account_circle</span>
          </div>
        </div>
        <div className="relative">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
          <input 
            className="w-full bg-white border-2 border-primary/40 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-slate-400" 
            placeholder="Buscar guías o vocabulario..." 
            type="text" 
          />
        </div>
      </header>

      <main className="px-6 space-y-8">
        <section>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-icons text-white">play_arrow</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Continuar Aprendiendo</p>
              <h3 className="text-sm font-semibold text-slate-800">Common Interview Questions</h3>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                <div className="bg-primary h-1.5 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">Inglés para Migración</h2>
            <button className="text-primary text-sm font-semibold bg-primary/5 px-3 py-1 rounded-full">Ver todo</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'flight_takeoff', label: 'Inmigración', level: 'A1-A2' },
              { icon: 'apartment', label: 'Alquiler', level: 'A2-B1' },
              { icon: 'medical_services', label: 'Servicios Médicos', level: 'B1' },
              { icon: 'work', label: 'Trámites Legales', level: 'B2' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <span className="material-icons text-primary">{item.icon}</span>
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">{item.label}</span>
                <span className="text-[10px] text-primary font-medium mt-1 uppercase tracking-tighter">Nivel {item.level}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mb-4">Vocabulario Técnico</h2>
          {[
            { 
              title: 'Software Development', 
              desc: 'Agile, Pull Requests, Code Review.', 
              vocab: '120 vocab', 
              level: 'B2+', 
              img: 'https://picsum.photos/seed/code/200/200' 
            },
            { 
              title: 'Data & Analytics', 
              desc: 'Presenting metrics and KPIs.', 
              vocab: '85 vocab', 
              level: 'C1', 
              img: 'https://picsum.photos/seed/data/200/200' 
            },
          ].map((course, idx) => (
            <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mb-3 items-center active:bg-slate-50 transition-all">
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <img alt={course.title} className="w-full h-full object-cover" src={course.img} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">{course.title}</h4>
                <p className="text-[11px] text-slate-500">{course.desc}</p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-bold uppercase">{course.vocab}</span>
                  <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded font-bold uppercase">{course.level}</span>
                </div>
              </div>
              <span className="material-icons text-primary">chevron_right</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Library;
