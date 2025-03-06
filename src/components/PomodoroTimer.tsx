
import { useState, useEffect, useRef } from "react";
import { PomodoroSettings } from "@/types/task";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onComplete?: () => void;
  className?: string;
}

type TimerMode = "work" | "break";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const PomodoroTimer = ({ settings, onComplete, className }: PomodoroTimerProps) => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [secondsLeft, setSecondsLeft] = useState(settings.workDuration * 60);
  const [currentSession, setCurrentSession] = useState(1);
  const intervalRef = useRef<number | null>(null);
  
  // Sound references
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const pauseSoundRef = useRef<HTMLAudioElement | null>(null);
  const resetSoundRef = useRef<HTMLAudioElement | null>(null);
  const completeSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    clickSoundRef.current = new Audio("/sounds/click.mp3");
    startSoundRef.current = new Audio("/sounds/start.mp3");
    pauseSoundRef.current = new Audio("/sounds/pause.mp3");
    resetSoundRef.current = new Audio("/sounds/reset.mp3");
    completeSoundRef.current = new Audio("/sounds/complete.mp3");
    
    // Preload sounds
    [clickSoundRef, startSoundRef, pauseSoundRef, resetSoundRef, completeSoundRef].forEach(ref => {
      if (ref.current) {
        ref.current.load();
      }
    });
    
    return () => {
      // Cleanup
      [clickSoundRef, startSoundRef, pauseSoundRef, resetSoundRef, completeSoundRef].forEach(ref => {
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

  const resetTimer = () => {
    setIsActive(false);
    setMode("work");
    setSecondsLeft(settings.workDuration * 60);
    setCurrentSession(1);
    playSound(resetSoundRef);
    
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleTimer = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    
    if (newIsActive) {
      playSound(startSoundRef);
    } else {
      playSound(pauseSoundRef);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prevSeconds) => {
          if (prevSeconds <= 1) {
            // Time's up!
            const isWorkMode = mode === "work";
            
            // Play completion sound
            playSound(completeSoundRef);
            
            // Show toast notification
            toast({
              title: `${isWorkMode ? "Work" : "Break"} session completed!`,
              description: isWorkMode 
                ? "Take a short break now." 
                : "Back to work!",
            });
            
            // Check if we've completed all sessions
            if (isWorkMode && currentSession >= settings.sessions) {
              // All sessions completed
              if (onComplete) onComplete();
              resetTimer();
              return 0;
            }
            
            // Switch modes
            if (isWorkMode) {
              // Work -> Break
              setMode("break");
              return settings.breakDuration * 60;
            } else {
              // Break -> Work, increment session
              setMode("work");
              setCurrentSession(prev => prev + 1);
              return settings.workDuration * 60;
            }
          }
          
          // Play tick sound on every 15 seconds mark if timer is running
          if (prevSeconds % 15 === 0) {
            playSound(clickSoundRef);
          }
          
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isActive, mode, currentSession, settings, onComplete, toast]);

  const getProgressColor = () => {
    return mode === "work" ? "bg-red-500" : "bg-green-500";
  };

  const getProgressPercentage = () => {
    const totalSeconds = mode === "work" 
      ? settings.workDuration * 60 
      : settings.breakDuration * 60;
    return Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 mb-1">
        <TimerIcon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {mode === "work" ? "Focus" : "Break"} - Session {currentSession}/{settings.sessions}
        </span>
      </div>
      
      <div className="relative h-2 w-full bg-gray-100 rounded overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${getProgressColor()} transition-all duration-1000 ease-linear`} 
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xl font-mono font-bold">{formatTime(secondsLeft)}</span>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={toggleTimer}
          >
            {isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={resetTimer}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
