
import { Task, TaskQuadrant } from "@/types/task";

export const calculateTaskPoints = (task: Task): number => {
  // Points based on quadrant (importance and urgency)
  const basePoints: Record<TaskQuadrant, number> = {
    "q1": 100, // Urgent & Important - highest points
    "q2": 75,  // Important & Not Urgent
    "q3": 50,  // Urgent & Not Important
    "q4": 25   // Not Urgent & Not Important - lowest points
  };
  
  // Base points from the task's quadrant
  let points = basePoints[task.quadrant];
  
  // Bonus points for tasks with active recall (learning tasks)
  if (task.activeRecall && task.activeRecall.length > 0) {
    points += 10 * task.activeRecall.length;
  }
  
  // Bonus points for spaced repetition tasks (shows commitment to learning)
  if (task.spacedRepetition) {
    points += 15 * (task.spacedRepetition.repetitionCount || 1);
  }
  
  // Bonus for interleaving tasks (more effective learning)
  if (task.interleaving) {
    points += 20;
  }
  
  // Bonus for pomodoro tasks (focused work)
  if (task.pomodoro) {
    points += 5 * task.pomodoro.sessions;
  }
  
  return points;
};

export const getPointsColor = (points: number): string => {
  if (points >= 500) return "text-purple-600";
  if (points >= 250) return "text-indigo-600";
  if (points >= 150) return "text-green-600";
  if (points >= 100) return "text-blue-600";
  if (points >= 50) return "text-amber-600";
  return "text-gray-600";
};
