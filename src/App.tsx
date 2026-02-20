
import React, { useState, useEffect } from 'react';
import { type ViewState, type User, CEFRLevel, type Certification } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Classroom from './components/Classroom';
import ProgressMap from './components/ProgressMap';
import Library from './components/Library';
import Navigation from './components/Navigation';
import CurriculumView from './components/CurriculumView';
import Profile from './components/Profile';
import PlacementTest from './components/PlacementTest';
import LevelModules from './components/LevelModules';
import Auth from './components/Auth';

const STORAGE_KEY = 'vene_english_user_data';

const INITIAL_USER_STATE: User = {
  name: 'Miguel',
  level: CEFRLevel.A2,
  currentModuleIndex: 0,
  progress: 5,
  wordsLearned: 842,
  practiceHours: 12,
  streak: 7,
  earnedCertificates: [
    {
      id: 'cert-a1-mock',
      level: CEFRLevel.A1,
      name: 'Acceso y Supervivencia',
      date: '15 ene. 2025',
      issuer: 'Vene-English Academy'
    }
  ]
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [pendingLevelChoice, setPendingLevelChoice] = useState<CEFRLevel | null>(null);
  
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return INITIAL_USER_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const navigate = (newView: ViewState) => setView(newView);

  const handleFinishPlacement = (finalLevel: CEFRLevel) => {
    setUser(prev => ({
      ...prev,
      level: finalLevel,
      currentModuleIndex: 0,
      progress: 0
    }));
    navigate('dashboard');
  };

  const handleUpdateUser = (updatedFields: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const handleAuthSuccess = (userData: { name: string }) => {
    setUser(prev => {
      const updatedUser = { ...prev, name: userData.name };
      if (pendingLevelChoice) {
        updatedUser.level = pendingLevelChoice;
        updatedUser.currentModuleIndex = 0;
        updatedUser.progress = 0;
      }
      return updatedUser;
    });

    if (pendingLevelChoice) {
      setPendingLevelChoice(null);
      navigate('level-modules');
    } else {
      navigate('dashboard');
    }
  };

  const handleLevelConfirmation = (level: CEFRLevel) => {
    setPendingLevelChoice(level);
    navigate('auth');
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(INITIAL_USER_STATE); // Restablecemos a Miguel o un estado base
    navigate('landing'); // Volvemos a la landing page sin sesión activa
  };

  const handleModuleComplete = () => {
    setUser(prev => {
      const nextIdx = prev.currentModuleIndex + 1;
      const isLevelComplete = nextIdx > 7;
      
      let newEarnedCertificates = [...prev.earnedCertificates];
      let newLevel = prev.level;

      if (prev.currentModuleIndex === 7) {
        const alreadyHasCert = prev.earnedCertificates.some(c => c.level === prev.level);
        if (!alreadyHasCert) {
          const newCert: Certification = {
            id: `cert-${prev.level}-${Date.now()}`,
            level: prev.level,
            name: prev.level === CEFRLevel.A1 ? 'Acceso y Supervivencia' : 
                  prev.level === CEFRLevel.A2 ? 'Plataforma e Intercambio' : 
                  prev.level === CEFRLevel.B1 ? 'Umbral de Autonomía' : 
                  'Certificación Profesional de Inglés',
            date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
            issuer: 'Vene-English Academy'
          };
          newEarnedCertificates.push(newCert);
        }

        const levels = Object.values(CEFRLevel);
        const currIdx = levels.indexOf(prev.level);
        if (currIdx < levels.length - 1) {
          newLevel = levels[currIdx + 1];
        }
      }

      if (isLevelComplete) {
        return {
          ...prev,
          level: newLevel,
          currentModuleIndex: 0,
          progress: 0,
          earnedCertificates: newEarnedCertificates
        };
      }

      return {
        ...prev,
        currentModuleIndex: nextIdx,
        progress: Math.floor(((nextIdx) / 8) * 100),
        earnedCertificates: newEarnedCertificates
      };
    });
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-[430px] bg-white shadow-2xl relative flex flex-col min-h-screen overflow-hidden text-slate-900">
        {view === 'landing' && (
          <LandingPage 
            onStart={() => navigate('curriculum')} 
            onLogin={() => navigate('auth')}
            onPlacementTest={() => navigate('placement-test')}
          />
        )}
        {view === 'auth' && (
          <Auth 
            onBack={() => navigate('landing')}
            onSuccess={handleAuthSuccess}
          />
        )}
        {view === 'placement-test' && (
          <PlacementTest 
            onCancel={() => navigate('landing')} 
            onFinish={handleFinishPlacement} 
          />
        )}
        {view === 'curriculum' && (
          <CurriculumView 
            onBack={() => navigate('landing')} 
            onConfirm={handleLevelConfirmation} 
          />
        )}
        {view === 'dashboard' && <Dashboard user={user} onJoinClass={() => navigate('classroom')} onShowModules={() => navigate('level-modules')} />}
        {view === 'level-modules' && <LevelModules user={user} onBack={() => navigate('dashboard')} onStartModule={() => navigate('classroom')} />}
        {view === 'classroom' && (
          <Classroom 
            user={user} 
            onExit={() => navigate('dashboard')} 
            onCompleteModule={handleModuleComplete}
          />
        )}
        {view === 'progress' && <ProgressMap user={user} />}
        {view === 'library' && <Library />}
        {view === 'profile' && (
          <Profile 
            user={user} 
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout} 
          />
        )}
        
        {view !== 'landing' && view !== 'auth' && view !== 'classroom' && view !== 'curriculum' && view !== 'placement-test' && view !== 'level-modules' && (
          <Navigation currentView={view} onNavigate={navigate} level={user.level} />
        )}
      </div>
    </div>
  );
};

export default App;