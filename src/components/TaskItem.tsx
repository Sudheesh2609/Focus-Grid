import { useState, useRef, useEffect } from "react";
import { Task, TaskQuadrant, ActiveRecallCard } from "@/types/task";
import { Pencil, Trash2, Timer as TimerIcon, Brain, Shuffle, Clock, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import TaskForm from "@/components/TaskForm";
import PomodoroTimer from "@/components/PomodoroTimer";
import ActiveRecall from "@/components/ActiveRecall";
import { format, isAfter } from "date-fns";
import { calculateTaskPoints, getPointsColor } from "@/utils/points";
import { useToast } from "@/components/ui/use-toast";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  quadrant: TaskQuadrant;
}

const TaskItem = ({ task, onUpdate, onDelete, quadrant }: TaskItemProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showActiveRecall, setShowActiveRecall] = useState(false);
  
  // Sound references
  const checkSoundRef = useRef<HTMLAudioElement | null>(null);
  const editSoundRef = useRef<HTMLAudioElement | null>(null);
  const deleteSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerToggleSoundRef = useRef<HTMLAudioElement | null>(null);

  // Check for due spaced repetition items
  const isDueForReview = task.spacedRepetition?.nextReview && 
    isAfter(new Date(), new Date(task.spacedRepetition.nextReview)) && 
    !task.completed;

  // Initialize audio elements
  useEffect(() => {
    checkSoundRef.current = new Audio("/sounds/check.mp3");
    editSoundRef.current = new Audio("/sounds/edit.mp3");
    deleteSoundRef.current = new Audio("/sounds/delete.mp3");
    timerToggleSoundRef.current = new Audio("/sounds/timer-toggle.mp3");
    
    // Preload sounds
    [checkSoundRef, editSoundRef, deleteSoundRef, timerToggleSoundRef].forEach(ref => {
      if (ref.current) {
        ref.current.load();
      }
    });
    
    return () => {
      // Cleanup
      [checkSoundRef, editSoundRef, deleteSoundRef, timerToggleSoundRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    };
  }, []);

  const playSound = (soundRef: React.RefObject<HTMLAudioElement>) => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(error => {
        console.error("Error playing sound:", error);
      });
    }
  };

  const handleToggleComplete = () => {
    playSound(checkSoundRef);
    
    const now = new Date();
    const points = calculateTaskPoints(task);
    
    // If this is a spaced repetition task and marked as complete
    if (task.spacedRepetition && !task.completed) {
      // Calculate new interval using a simple spaced repetition algorithm
      // Double the interval each successful review
      const newInterval = task.spacedRepetition.interval * 2;
      const nextReview = new Date();
      nextReview.setDate(now.getDate() + newInterval);
      
      onUpdate({
        ...task,
        completed: true,
        completedAt: now.toISOString(),
        points: points,
        spacedRepetition: {
          ...task.spacedRepetition,
          interval: newInterval,
          lastReviewed: now.toISOString(),
          nextReview: nextReview.toISOString(),
          repetitionCount: task.spacedRepetition.repetitionCount + 1
        }
      });
      
      // Show toast with points earned
      toast({
        title: `+${points} Points!`,
        description: "Great job completing your spaced repetition task!",
      });
    } else {
      onUpdate({
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? now.toISOString() : undefined,
        points: !task.completed ? points : undefined,
      });
      
      // Only show toast when completing a task, not when uncompleting
      if (!task.completed) {
        toast({
          title: `+${points} Points!`,
          description: "Task completed successfully!",
        });
      }
    }
  };

  const handleUpdateTask = (updatedTaskData: Omit<Task, "id">) => {
    onUpdate({
      ...task,
      ...updatedTaskData,
      quadrant, // Ensure the quadrant doesn't change during edit
    });
    setIsEditing(false);
  };

  const handleUpdateActiveRecallCards = (cards: ActiveRecallCard[]) => {
    onUpdate({
      ...task,
      activeRecall: cards.length > 0 ? cards : undefined
    });
  };

  const handleTimerComplete = () => {
    if (!task.completed) {
      playSound(checkSoundRef);
      onUpdate({
        ...task,
        completed: true,
      });
    }
  };

  const handleEditClick = () => {
    playSound(editSoundRef);
    setIsEditing(true);
  };

  const handleDeleteClick = () => {
    playSound(deleteSoundRef);
    onDelete(task.id);
  };

  const handleTimerToggle = () => {
    playSound(timerToggleSoundRef);
    setShowTimer(!showTimer);
  };

  const handleActiveRecallToggle = () => {
    playSound(timerToggleSoundRef);
    setShowActiveRecall(!showActiveRecall);
  };

  const getQuadrantColor = () => {
    switch (quadrant) {
      case "q1":
        return "text-matrix-q1";
      case "q2":
        return "text-matrix-q2";
      case "q3":
        return "text-matrix-q3";
      case "q4":
        return "text-matrix-q4";
      default:
        return "";
    }
  };

  if (isEditing) {
    return (
      <TaskForm
        task={task}
        onSubmit={handleUpdateTask}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-2 p-3 rounded-md bg-white shadow-sm border transition-all ${isDueForReview ? 'border-yellow-400 bg-yellow-50' : ''} ${task.completed ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-2">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          className={`mt-1 ${getQuadrantColor()}`}
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm mt-1 text-gray-600 ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1 mt-2">
            {task.subject && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {task.subject}
              </Badge>
            )}
            
            {task.interleaving && (
              <Badge variant="outline" className="text-xs px-1 py-0 bg-purple-50 border-purple-200 flex items-center gap-0.5">
                <Shuffle className="h-2.5 w-2.5" />
                <span>Interleaving</span>
              </Badge>
            )}
            
            {task.spacedRepetition && (
              <Badge variant="outline" className={`text-xs px-1 py-0 ${isDueForReview ? 'bg-yellow-100 border-yellow-300' : 'bg-blue-50 border-blue-200'} flex items-center gap-0.5`}>
                <Brain className="h-2.5 w-2.5" />
                <span>SR: {task.spacedRepetition.interval}d</span>
              </Badge>
            )}
            
            {task.spacedRepetition?.nextReview && !task.completed && (
              <Badge variant="outline" className={`text-xs px-1 py-0 ${isDueForReview ? 'bg-yellow-100 border-yellow-300' : 'bg-blue-50 border-blue-200'} flex items-center gap-0.5`}>
                <Clock className="h-2.5 w-2.5" />
                <span>Next: {format(new Date(task.spacedRepetition.nextReview), 'MMM d')}</span>
              </Badge>
            )}
            
            {task.activeRecall && task.activeRecall.length > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0 bg-indigo-50 border-indigo-200 flex items-center gap-0.5">
                <BookOpen className="h-2.5 w-2.5" />
                <span>Cards: {task.activeRecall.length}</span>
              </Badge>
            )}
            
            {task.completed && task.points && (
              <Badge variant="outline" className={`text-xs px-1 py-0 bg-amber-50 border-amber-200 flex items-center gap-0.5 ${getPointsColor(task.points)}`}>
                <Trophy className="h-2.5 w-2.5" />
                <span>{task.points} pts</span>
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-1 ml-2">
          {task.activeRecall && task.activeRecall.length > 0 && !task.completed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleActiveRecallToggle}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          )}
          
          {task.pomodoro && !task.completed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleTimerToggle}
            >
              <TimerIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showTimer && task.pomodoro && !task.completed && (
        <PomodoroTimer 
          settings={task.pomodoro} 
          onComplete={handleTimerComplete}
          className="mt-2 pt-2 border-t"
        />
      )}
      
      {showActiveRecall && task.activeRecall && task.activeRecall.length > 0 && !task.completed && (
        <ActiveRecall 
          cards={task.activeRecall}
          onUpdate={handleUpdateActiveRecallCards} 
          className="mt-2 pt-2 border-t"
        />
      )}
    </div>
  );
};

export default TaskItem;
