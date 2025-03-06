
import { useState, useRef, useEffect } from "react";
import { Task, TaskQuadrant } from "@/types/task";
import { Pencil, Trash2, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TaskForm from "@/components/TaskForm";
import PomodoroTimer from "@/components/PomodoroTimer";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  quadrant: TaskQuadrant;
}

const TaskItem = ({ task, onUpdate, onDelete, quadrant }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  
  // Sound references
  const checkSoundRef = useRef<HTMLAudioElement | null>(null);
  const editSoundRef = useRef<HTMLAudioElement | null>(null);
  const deleteSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerToggleSoundRef = useRef<HTMLAudioElement | null>(null);

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
    onUpdate({
      ...task,
      completed: !task.completed,
    });
  };

  const handleUpdateTask = (updatedTaskData: Omit<Task, "id">) => {
    onUpdate({
      ...task,
      ...updatedTaskData,
      quadrant, // Ensure the quadrant doesn't change during edit
    });
    setIsEditing(false);
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
    <div className={`flex flex-col gap-2 p-3 rounded-md bg-white shadow-sm border transition-all ${task.completed ? 'opacity-70' : ''}`}>
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
        </div>
        
        <div className="flex gap-1 ml-2">
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
    </div>
  );
};

export default TaskItem;
