
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import EisenhowerMatrix from "@/components/EisenhowerMatrix";
import { Task, TaskQuadrant } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Brain, Shuffle } from "lucide-react";
import { isAfter } from "date-fns";

const Index = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Initialize with localStorage if available
    const savedTasks = localStorage.getItem("eisenhowerTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [showDueOnly, setShowDueOnly] = useState(false);
  const [interleavingMode, setInterleavingMode] = useState(false);
  
  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("eisenhowerTasks", JSON.stringify(tasks));
  }, [tasks]);
  
  // Filter for due tasks
  const filteredTasks = tasks.filter(task => {
    if (!showDueOnly) return true;
    if (task.completed) return false;
    if (!task.spacedRepetition?.nextReview) return false;
    
    return isAfter(new Date(), new Date(task.spacedRepetition.nextReview));
  });

  // Sort tasks for interleaving if enabled
  const processedTasks = interleavingMode 
    ? interleaveTasksBySubject(filteredTasks) 
    : filteredTasks;

  const addTask = (task: Omit<Task, "id">) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    
    toast({
      title: "Task added",
      description: `"${task.title}" added to ${getQuadrantLabel(task.quadrant)}`,
    });
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    
    toast({
      title: "Task updated",
      description: `"${updatedTask.title}" has been updated`,
    });
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    
    toast({
      title: "Task deleted",
      description: taskToDelete ? `"${taskToDelete.title}" has been deleted` : "Task has been deleted",
      variant: "destructive",
    });
  };

  const getQuadrantLabel = (quadrant: TaskQuadrant) => {
    switch (quadrant) {
      case "q1":
        return "Urgent & Important";
      case "q2":
        return "Important & Not Urgent";
      case "q3":
        return "Urgent & Not Important";
      case "q4":
        return "Not Urgent & Not Important";
      default:
        return "Unknown";
    }
  };
  
  // Function to interleave tasks by subject
  function interleaveTasksBySubject(tasks: Task[]): Task[] {
    // Only include tasks marked for interleaving or with spaced repetition
    const interleavableTasks = tasks.filter(task => 
      (task.interleaving || task.spacedRepetition) && !task.completed
    );
    
    // Group tasks by subject
    const subjectGroups: Record<string, Task[]> = {};
    
    interleavableTasks.forEach(task => {
      const subject = task.subject || 'Uncategorized';
      if (!subjectGroups[subject]) {
        subjectGroups[subject] = [];
      }
      subjectGroups[subject].push(task);
    });
    
    // Create interleaved list
    const interleaved: Task[] = [];
    let hasMoreTasks = true;
    let index = 0;
    
    const subjects = Object.keys(subjectGroups);
    
    while (hasMoreTasks) {
      hasMoreTasks = false;
      
      for (const subject of subjects) {
        if (index < subjectGroups[subject].length) {
          interleaved.push(subjectGroups[subject][index]);
          hasMoreTasks = true;
        }
      }
      
      index++;
    }
    
    // Add the non-interleaving tasks back
    const nonInterleavableTasks = tasks.filter(task => 
      !task.interleaving && !task.spacedRepetition
    );
    
    return [...interleaved, ...nonInterleavableTasks];
  }

  // Count due spaced repetition tasks
  const dueTasksCount = tasks.filter(task => {
    if (task.completed) return false;
    if (!task.spacedRepetition?.nextReview) return false;
    return isAfter(new Date(), new Date(task.spacedRepetition.nextReview));
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={showDueOnly ? "default" : "outline"}
              onClick={() => setShowDueOnly(!showDueOnly)}
              className="flex items-center gap-1"
            >
              <Brain className="h-4 w-4" />
              <span>Due for Review ({dueTasksCount})</span>
            </Button>
            
            <Button
              size="sm"
              variant={interleavingMode ? "default" : "outline"}
              onClick={() => setInterleavingMode(!interleavingMode)}
              className="flex items-center gap-1"
            >
              <Shuffle className="h-4 w-4" />
              <span>Interleaving Mode</span>
            </Button>
          </div>
          
          {(showDueOnly || interleavingMode) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowDueOnly(false);
                setInterleavingMode(false);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
        
        <EisenhowerMatrix 
          tasks={processedTasks} 
          onAddTask={addTask} 
          onUpdateTask={updateTask} 
          onDeleteTask={deleteTask} 
        />
      </main>
    </div>
  );
};

export default Index;
