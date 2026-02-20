
import React from 'react';
import { type ViewState, CEFRLevel } from '../types';

interface Props {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  level: CEFRLevel;
}

const Navigation: React.FC<Props> = ({ currentView, onNavigate, level }) => {
  const navItems = [
    { view: 'dashboard', icon: 'home', label: 'Inicio' },
    { view: 'progress', icon: 'bar_chart', label: 'Progreso' },
    { view: 'library', icon: 'local_library', label: 'Biblioteca' },
    { view: 'profile', icon: 'account_circle', label: 'Perfil' },
  ];

  return (
    <nav className="absolute bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 pb-8 pt-4 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <button
          key={item.view}
          onClick={() => onNavigate(item.view as ViewState)}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === item.view ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <span className={`material-icons ${currentView === item.view ? 'font-bold' : ''}`}>
            {item.icon}
          </span>
          <span className={`text-[10px] font-medium ${currentView === item.view ? 'font-bold' : ''}`}>
            {item.label}
          </span>
        </button>
      ))}
      
      <div className="absolute left-1/2 -translate-x-1/2 -top-8">
        <button 
          onClick={() => onNavigate('classroom')}
          className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/40 ring-4 ring-white active:scale-90 transition-transform"
        >
          <span className="text-white text-xl font-black tracking-tighter drop-shadow-sm">
            {level}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
