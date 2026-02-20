
import React, { useState } from 'react';
import { CEFRLevel } from '../types';

interface Question {
  id: number;
  level: CEFRLevel;
  text: string;
  options: string[];
  answer: string;
}

interface Props {
  onCancel: () => void;
  onFinish: (level: CEFRLevel) => void;
}

const PlacementTest: React.FC<Props> = ({ onCancel, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scorePerLevel, setScorePerLevel] = useState<Record<CEFRLevel, number>>({
    [CEFRLevel.A1]: 0,
    [CEFRLevel.A2]: 0,
    [CEFRLevel.B1]: 0,
    [CEFRLevel.B2]: 0,
    [CEFRLevel.C1]: 0,
    [CEFRLevel.C2]: 0,
  });
  const [isFinished, setIsFinished] = useState(false);

  const questions: Question[] = [
    // A1
    { id: 1, level: CEFRLevel.A1, text: "Choose the correct sentence:", options: ["I have 20 years", "I am 20 years old", "I am 20 years"], answer: "I am 20 years old" },
    { id: 2, level: CEFRLevel.A1, text: "How do you say 'Hola' in English?", options: ["Hello", "Good", "Thanks"], answer: "Hello" },
    // A2
    { id: 3, level: CEFRLevel.A2, text: "Yesterday, I ___ to the cinema.", options: ["go", "went", "gone"], answer: "went" },
    { id: 4, level: CEFRLevel.A2, text: "He is ___ than his brother.", options: ["tall", "taller", "the tallest"], answer: "taller" },
    // B1
    { id: 5, level: CEFRLevel.B1, text: "If I ___ enough money, I would buy a car.", options: ["have", "had", "will have"], answer: "had" },
    { id: 6, level: CEFRLevel.B1, text: "I have been living here ___ 2010.", options: ["for", "since", "during"], answer: "since" },
    // B2
    { id: 7, level: CEFRLevel.B2, text: "The project ___ by the end of next week.", options: ["will finish", "will have been finished", "is finishing"], answer: "will have been finished" },
    { id: 8, level: CEFRLevel.B2, text: "Despite ___ hard, he didn't pass.", options: ["work", "working", "he worked"], answer: "working" },
    // C1
    { id: 9, level: CEFRLevel.C1, text: "Hardly ___ entered the room when the phone rang.", options: ["I had", "had I", "did I"], answer: "had I" },
    { id: 10, level: CEFRLevel.C1, text: "I'd rather you ___ tell him the truth.", options: ["didn't", "don't", "not"], answer: "didn't" },
    // C2
    { id: 11, level: CEFRLevel.C2, text: "The CEO was ___ with criticism after the scandal.", options: ["deluged", "shaken", "burned"], answer: "deluged" },
    { id: 12, level: CEFRLevel.C2, text: "Were it not for your help, I ___ where I am today.", options: ["wouldn't be", "won't be", "am not"], answer: "wouldn't be" },
  ];

  const handleAnswer = (option: string) => {
    const q = questions[currentIdx];
    if (option === q.answer) {
      setScorePerLevel(prev => ({
        ...prev,
        [q.level]: prev[q.level] + 1
      }));
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const calculateResultLevel = (): CEFRLevel => {
    // Basic logic: The user is placed in the highest level where they got at least 1 correct answer,
    // or if they mastered all previous levels.
    const levels = [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2, CEFRLevel.C1, CEFRLevel.C2];
    let recommended: CEFRLevel = CEFRLevel.A1;
    
    for (const lvl of levels) {
      if (scorePerLevel[lvl] >= 1) {
        recommended = lvl;
      } else {
        // If they failed a lower level completely, we stop here (simple model)
        break;
      }
    }
    return recommended;
  };

  if (isFinished) {
    const finalLevel = calculateResultLevel();
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
          <span className="material-icons text-primary text-5xl">verified</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">¡Prueba Completada!</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Basado en tus respuestas, hemos determinado que tu nivel ideal para comenzar es:
        </p>
        
        <div className="bg-slate-50 border-2 border-primary/20 rounded-3xl p-8 w-full mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
          <span className="text-5xl font-black text-primary mb-2 block">{finalLevel}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nivel Recomendado</span>
        </div>

        <div className="w-full space-y-4">
          <button 
            onClick={() => onFinish(finalLevel)}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/25 active:scale-95 transition-all"
          >
            Empezar mi camino {finalLevel}
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <header className="px-6 pt-12 pb-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-icons">close</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Nivelando tu Inglés</span>
          <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="w-6"></div>
      </header>

      <main className="flex-1 p-8 flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
              Pregunta {currentIdx + 1} de {questions.length}
            </span>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {currentQ.text}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className="w-full p-5 text-left bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-between group"
              >
                <span>{option}</span>
                <span className="material-icons text-slate-200 group-hover:text-primary transition-colors">chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-3 bg-accent-yellow/10 p-4 rounded-2xl border border-accent-yellow/20">
            <span className="material-icons text-accent-orange text-lg">lightbulb</span>
            <p className="text-[11px] text-slate-600 leading-tight font-medium">
              No te preocupes si no sabes una respuesta, solo elige la que creas correcta. ¡Queremos saber tu punto de partida real, chamo!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlacementTest;

