
import { useState } from "react";
import { Task, PomodoroSettings } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Timer } from "lucide-react";
import { Label } from "@/components/ui/label";

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, "id">) => void;
  onCancel: () => void;
}

const defaultPomodoroSettings: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  sessions: 4,
};

const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [showPomodoroSettings, setShowPomodoroSettings] = useState(!!task?.pomodoro);
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(
    task?.pomodoro || defaultPomodoroSettings
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      quadrant: task?.quadrant || "q1",
      completed: task?.completed || false,
      createdAt: task?.createdAt || new Date().toISOString(),
      pomodoro: showPomodoroSettings ? pomodoroSettings : undefined,
    });
    
    setTitle("");
    setDescription("");
    setPomodoroSettings(defaultPomodoroSettings);
    setShowPomodoroSettings(false);
  };

  const handlePomodoroChange = (field: keyof PomodoroSettings, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    
    setPomodoroSettings({
      ...pomodoroSettings,
      [field]: numValue,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white p-3 rounded-md shadow-sm border">
      <Input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full"
        autoFocus
      />
      
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full"
        rows={2}
      />
      
      <div className="flex items-center justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          className="text-xs flex items-center gap-1"
          onClick={() => setShowPomodoroSettings(!showPomodoroSettings)}
        >
          <Timer className="h-3.5 w-3.5" />
          {showPomodoroSettings ? "Hide Timer Settings" : "Add Timer Settings"}
        </Button>
      </div>
      
      {showPomodoroSettings && (
        <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-md">
          <div>
            <Label htmlFor="workDuration" className="text-xs">Work (min)</Label>
            <Input
              id="workDuration"
              type="number"
              min="1"
              value={pomodoroSettings.workDuration}
              onChange={(e) => handlePomodoroChange("workDuration", e.target.value)}
              className="h-8"
            />
          </div>
          
          <div>
            <Label htmlFor="breakDuration" className="text-xs">Break (min)</Label>
            <Input
              id="breakDuration"
              type="number"
              min="1"
              value={pomodoroSettings.breakDuration}
              onChange={(e) => handlePomodoroChange("breakDuration", e.target.value)}
              className="h-8"
            />
          </div>
          
          <div>
            <Label htmlFor="sessions" className="text-xs">Sessions</Label>
            <Input
              id="sessions"
              type="number"
              min="1"
              value={pomodoroSettings.sessions}
              onChange={(e) => handlePomodoroChange("sessions", e.target.value)}
              className="h-8"
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim()}>
          {task ? "Update" : "Add"} Task
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
