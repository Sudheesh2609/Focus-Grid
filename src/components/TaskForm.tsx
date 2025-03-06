import { useState } from "react";
import { Task, PomodoroSettings, SpacedRepetition, RecurrenceSettings, RecurrenceInterval } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Timer, Brain, Shuffle, BookOpen, Repeat, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { addDays, format, addWeeks, addMonths } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const defaultSpacedRepetition: SpacedRepetition = {
  enabled: true,
  interval: 1, // Start with 1 day
  lastReviewed: null,
  nextReview: new Date().toISOString(), // Start today
  repetitionCount: 0,
};

const defaultRecurrenceSettings: RecurrenceSettings = {
  enabled: true,
  interval: 'daily',
  nextOccurrence: new Date().toISOString(),
  lastCompleted: null,
};

const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [subject, setSubject] = useState(task?.subject || "");
  const [showPomodoroSettings, setShowPomodoroSettings] = useState(!!task?.pomodoro);
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(
    task?.pomodoro || defaultPomodoroSettings
  );
  
  // Spaced repetition settings
  const [showSpacedRepetition, setShowSpacedRepetition] = useState(!!task?.spacedRepetition);
  const [spacedRepetition, setSpacedRepetition] = useState<SpacedRepetition>(
    task?.spacedRepetition || defaultSpacedRepetition
  );
  
  // Recurrence settings
  const [showRecurrence, setShowRecurrence] = useState(!!task?.recurrence);
  const [recurrenceSettings, setRecurrenceSettings] = useState<RecurrenceSettings>(
    task?.recurrence || defaultRecurrenceSettings
  );
  const [customDays, setCustomDays] = useState(task?.recurrence?.customDays?.toString() || "7");
  
  // Interleaving setting
  const [interleaving, setInterleaving] = useState(task?.interleaving || false);
  
  // Active recall settings
  const [showActiveRecall, setShowActiveRecall] = useState(!!task?.activeRecall);
  const [activeRecallQuestion, setActiveRecallQuestion] = useState("");
  const [activeRecallAnswer, setActiveRecallAnswer] = useState("");
  const [activeRecallCards, setActiveRecallCards] = useState<any[]>(
    task?.activeRecall || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const now = new Date();
    const nextReviewDate = showSpacedRepetition 
      ? addDays(now, spacedRepetition.interval).toISOString() 
      : null;
    
    // Calculate next occurrence date based on recurrence interval
    let nextOccurrenceDate = now;
    if (showRecurrence) {
      switch (recurrenceSettings.interval) {
        case 'daily':
          nextOccurrenceDate = addDays(now, 1);
          break;
        case 'weekly':
          nextOccurrenceDate = addWeeks(now, 1);
          break;
        case 'biweekly':
          nextOccurrenceDate = addWeeks(now, 2);
          break;
        case 'monthly':
          nextOccurrenceDate = addMonths(now, 1);
          break;
        case 'custom':
          const days = parseInt(customDays, 10) || 7;
          nextOccurrenceDate = addDays(now, days);
          break;
      }
    }
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim() || undefined,
      quadrant: task?.quadrant || "q1",
      completed: task?.completed || false,
      createdAt: task?.createdAt || new Date().toISOString(),
      pomodoro: showPomodoroSettings ? pomodoroSettings : undefined,
      spacedRepetition: showSpacedRepetition ? {
        ...spacedRepetition,
        nextReview: nextReviewDate,
      } : undefined,
      interleaving: interleaving || undefined,
      activeRecall: showActiveRecall && activeRecallCards.length > 0 ? activeRecallCards : undefined,
      recurrence: showRecurrence ? {
        ...recurrenceSettings,
        nextOccurrence: nextOccurrenceDate.toISOString(),
        customDays: recurrenceSettings.interval === 'custom' ? parseInt(customDays, 10) || 7 : undefined,
      } : undefined,
    });
    
    setTitle("");
    setDescription("");
    setSubject("");
    setPomodoroSettings(defaultPomodoroSettings);
    setSpacedRepetition(defaultSpacedRepetition);
    setRecurrenceSettings(defaultRecurrenceSettings);
    setInterleaving(false);
    setShowPomodoroSettings(false);
    setShowSpacedRepetition(false);
    setShowRecurrence(false);
    setShowActiveRecall(false);
    setActiveRecallCards([]);
  };

  const handlePomodoroChange = (field: keyof PomodoroSettings, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    
    setPomodoroSettings({
      ...pomodoroSettings,
      [field]: numValue,
    });
  };

  const handleSpacedIntervalChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    
    setSpacedRepetition({
      ...spacedRepetition,
      interval: numValue,
    });
  };
  
  const handleRecurrenceIntervalChange = (value: RecurrenceInterval) => {
    setRecurrenceSettings({
      ...recurrenceSettings,
      interval: value,
    });
  };
  
  const handleAddActiveRecallCard = () => {
    if (!activeRecallQuestion.trim() || !activeRecallAnswer.trim()) return;
    
    setActiveRecallCards([
      ...activeRecallCards,
      {
        question: activeRecallQuestion.trim(),
        answer: activeRecallAnswer.trim(),
        lastPerformance: null
      }
    ]);
    
    setActiveRecallQuestion("");
    setActiveRecallAnswer("");
  };
  
  const handleRemoveActiveRecallCard = (index: number) => {
    const newCards = [...activeRecallCards];
    newCards.splice(index, 1);
    setActiveRecallCards(newCards);
  };

  // Function to generate preview text for the next occurrence
  const getNextOccurrenceText = () => {
    const now = new Date();
    let nextDate;
    
    switch (recurrenceSettings.interval) {
      case 'daily':
        nextDate = addDays(now, 1);
        return `Tomorrow (${format(nextDate, 'MMM d, yyyy')})`;
      case 'weekly':
        nextDate = addWeeks(now, 1);
        return `Next week (${format(nextDate, 'MMM d, yyyy')})`;
      case 'biweekly':
        nextDate = addWeeks(now, 2);
        return `In two weeks (${format(nextDate, 'MMM d, yyyy')})`;
      case 'monthly':
        nextDate = addMonths(now, 1);
        return `Next month (${format(nextDate, 'MMM d, yyyy')})`;
      case 'custom':
        const days = parseInt(customDays, 10) || 7;
        nextDate = addDays(now, days);
        return `In ${days} days (${format(nextDate, 'MMM d, yyyy')})`;
      default:
        return 'Unknown';
    }
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
      
      <Input
        placeholder="Subject/Category (for interleaving)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full"
      />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
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
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className="text-xs flex items-center gap-1"
            onClick={() => setShowSpacedRepetition(!showSpacedRepetition)}
          >
            <Brain className="h-3.5 w-3.5" />
            {showSpacedRepetition ? "Hide Spaced Repetition" : "Add Spaced Repetition"}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className="text-xs flex items-center gap-1"
            onClick={() => setShowRecurrence(!showRecurrence)}
          >
            <Repeat className="h-3.5 w-3.5" />
            {showRecurrence ? "Hide Recurrence" : "Add Recurrence"}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className="text-xs flex items-center gap-1"
            onClick={() => setShowActiveRecall(!showActiveRecall)}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {showActiveRecall ? "Hide Active Recall" : "Add Active Recall"}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="interleaving" 
            checked={interleaving}
            onCheckedChange={setInterleaving}
          />
          <Label htmlFor="interleaving" className="text-xs flex items-center gap-1">
            <Shuffle className="h-3.5 w-3.5" />
            Interleave with other subjects
          </Label>
        </div>
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
      
      {showSpacedRepetition && (
        <div className="p-2 bg-gray-50 rounded-md space-y-2">
          <div>
            <Label htmlFor="interval" className="text-xs">Review Interval (days)</Label>
            <Input
              id="interval"
              type="number"
              min="1"
              value={spacedRepetition.interval}
              onChange={(e) => handleSpacedIntervalChange(e.target.value)}
              className="h-8"
            />
          </div>
          <p className="text-xs text-gray-500">
            Next review: {spacedRepetition.nextReview 
              ? format(new Date(spacedRepetition.nextReview), 'MMM d, yyyy') 
              : format(addDays(new Date(), spacedRepetition.interval), 'MMM d, yyyy')}
          </p>
        </div>
      )}
      
      {showRecurrence && (
        <div className="p-2 bg-gray-50 rounded-md space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="recurrenceInterval" className="text-xs flex-shrink-0">Repeats:</Label>
            <Select
              value={recurrenceSettings.interval}
              onValueChange={(value) => handleRecurrenceIntervalChange(value as RecurrenceInterval)}
            >
              <SelectTrigger className="h-8 flex-grow">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {recurrenceSettings.interval === 'custom' && (
            <div className="flex items-center gap-2">
              <Label htmlFor="customDays" className="text-xs">Every</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="h-8 w-16"
              />
              <span className="text-xs">days</span>
            </div>
          )}
          
          <p className="text-xs text-gray-500">
            Next occurrence: {getNextOccurrenceText()}
          </p>
        </div>
      )}
      
      {showActiveRecall && (
        <div className="p-2 bg-gray-50 rounded-md space-y-2">
          <p className="text-xs font-medium flex items-center gap-1 mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            Active Recall Cards ({activeRecallCards.length})
          </p>
          
          {activeRecallCards.length > 0 && (
            <div className="space-y-2 mb-3">
              {activeRecallCards.map((card, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded border text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{card.question}</div>
                    <div className="text-gray-500 truncate text-xs">{card.answer}</div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive" 
                    onClick={() => handleRemoveActiveRecallCard(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="space-y-2">
            <Input
              placeholder="Question"
              value={activeRecallQuestion}
              onChange={(e) => setActiveRecallQuestion(e.target.value)}
              className="text-sm"
            />
            <Textarea
              placeholder="Answer"
              value={activeRecallAnswer}
              onChange={(e) => setActiveRecallAnswer(e.target.value)}
              className="text-sm"
              rows={2}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddActiveRecallCard}
              disabled={!activeRecallQuestion.trim() || !activeRecallAnswer.trim()}
              className="w-full"
            >
              Add Card
            </Button>
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
