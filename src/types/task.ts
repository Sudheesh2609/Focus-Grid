
export type TaskQuadrant = "q1" | "q2" | "q3" | "q4";

export interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  sessions: number; // number of pomodoro sessions
}

export interface SpacedRepetition {
  enabled: boolean;
  interval: number; // Current interval in days
  lastReviewed: string | null; // ISO date string
  nextReview: string | null; // ISO date string
  repetitionCount: number; // Number of times reviewed
}

export interface ActiveRecallCard {
  question: string;
  answer: string;
  lastPerformance: 'correct' | 'incorrect' | null; // How well the student recalled this card
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: TaskQuadrant;
  completed: boolean;
  createdAt: string;
  pomodoro?: PomodoroSettings;
  spacedRepetition?: SpacedRepetition;
  interleaving?: boolean; // Whether this task should be interleaved with others
  subject?: string; // Subject category for interleaving
  activeRecall?: ActiveRecallCard[]; // Cards for active recall practice
}
