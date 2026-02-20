export const CEFRLevel = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2'
} as const;

export type CEFRLevel = typeof CEFRLevel[keyof typeof CEFRLevel];

export interface Certification {
  id: string;
  level: CEFRLevel;
  name: string;
  date: string;
  issuer: string;
}

export interface User {
  name: string;
  avatar?: string;
  level: CEFRLevel;
  currentModuleIndex: number; // 0 to 7
  progress: number;
  wordsLearned: number;
  practiceHours: number;
  streak: number;
  earnedCertificates: Certification[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  week: number;
}

export interface LevelCurriculum {
  level: CEFRLevel;
  title: string;
  description: string;
  modules: Module[];
}

export type ViewState = 'landing' | 'auth' | 'curriculum' | 'dashboard' | 'classroom' | 'progress' | 'library' | 'profile' | 'placement-test' | 'level-modules';
