
export type TaskQuadrant = "q1" | "q2" | "q3" | "q4";

export interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  sessions: number; // number of pomodoro sessions
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: TaskQuadrant;
  completed: boolean;
  createdAt: string;
  pomodoro?: PomodoroSettings;
}
