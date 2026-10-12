export interface Module {
  id: number;
  title: string;
  days: [number, number];
  icon: string;
  color: string;
}

export interface Day {
  day: number;
  slug: string;
  title: string;
  module: {
    id: number;
    title: string;
    color: string;
    icon: string;
  };
  goal: string;
  time: string;
  isPaid: boolean;
  checklist: string[];
  rawContent: string;
}

export interface Cheatsheet {
  id: string;
  title: string;
  content: string;
}

export interface CurriculumData {
  modules: Module[];
  days: Day[];
  cheatsheets: Cheatsheet[];
  glossary: string;
  interview: string;
  certifications: string;
  capstone: string;
}

export type ViewMode = 'curriculum' | 'day' | 'cheatsheets' | 'glossary' | 'interview' | 'capstone' | 'certifications';

export interface UserProgress {
  completedDays: number[];
  checklistStatus: Record<string, boolean>; // key format: `day_${dayNum}_${index}`
  lastActiveDay: number;
}
