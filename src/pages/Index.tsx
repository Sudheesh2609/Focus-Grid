import { useState, useEffect } from "react";
import Header from "@/components/Header";
import EisenhowerMatrix from "@/components/EisenhowerMatrix";
import TaskAnalysis from "@/components/TaskAnalysis";
import { Task, TaskQuadrant } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Shuffle, Repeat, BarChart3, Grid2X2 } from "lucide-react";
import { isAfter, parseISO, addDays, addWeeks, addMonths } from "date-fns";
import { calculateTaskPoints, getPointsColor } from "@/utils/points";

const Index = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("eisenhowerTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [showDueOnly, setShowDueOnly] = useState(false);
  const [interleavingMode, setInterleavingMode] = useState(false);
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("matrix");
  const [totalPoints, setTotalPoints] = useState(0);
  
  useEffect(() => {
    localStorage.setItem("eisenhowerTasks", JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    const points = tasks.reduce((total, task) => {
      return total + (task.points || 0);
    }, 0);
    setTotalPoints(points);
  }, [tasks]);
  
  useEffect(() => {
    const now = new Date();
    const updatedTasks = [...tasks];
    let tasksChanged = false;
    
    tasks.forEach((task) => {
      if (!task.recurrence || !task.completed) return;
      
      const nextOccurrence = parseISO(task.recurrence.nextOccurrence);
      
      if (isAfter(now, nextOccurrence)) {
        let newNextOccurrence = new Date();
        
        switch (task.recurrence.interval) {
          case 'daily':
            newNextOccurrence = addDays(now, 1);
            break;
          case 'weekly':
            newNextOccurrence = addWeeks(now, 1);
            break;
          case 'biweekly':
            newNextOccurrence = addWeeks(now, 2);
            break;
          case 'monthly':
            newNextOccurrence = addMonths(now, 1);
            break;
          case 'custom':
            if (task.recurrence.customDays) {
              newNextOccurrence = addDays(now, task.recurrence.customDays);
            } else {
              newNextOccurrence = addDays(now, 7);
            }
            break;
        }
        
        const newTask: Task = {
          ...task,
          id: Date.now().toString(),
          completed: false,
          createdAt: now.toISOString(),
          recurrence: {
            ...task.recurrence,
            nextOccurrence: newNextOccurrence.toISOString(),
            lastCompleted: now.toISOString(),
          }
        };
        
        const oldTaskIndex = updatedTasks.findIndex(t => t.id === task.id);
        if (oldTaskIndex !== -1) {
          updatedTasks[oldTaskIndex] = {
            ...updatedTasks[oldTaskIndex],
            recurrence: {
              ...updatedTasks[oldTaskIndex].recurrence!,
              lastCompleted: now.toISOString(),
            }
          };
        }
        
        updatedTasks.push(newTask);
        tasksChanged = true;
        
        toast({
          title: "Recurring task created",
          description: `"${task.title}" has been recreated based on its recurrence schedule.`,
        });
      }
    });
    
    if (tasksChanged) {
      setTasks(updatedTasks);
    }
  }, [tasks, toast]);
  
  const filteredTasks = tasks.filter(task => {
    if (showDueOnly) {
      if (task.completed) return false;
      if (!task.spacedRepetition?.nextReview) return false;
      return isAfter(new Date(), new Date(task.spacedRepetition.nextReview));
    }
    
    if (showRecurringOnly) {
      return !!task.recurrence;
    }
    
    return true;
  });

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
  
  function interleaveTasksBySubject(tasks: Task[]): Task[] {
    const interleavableTasks = tasks.filter(task => 
      (task.interleaving || task.spacedRepetition) && !task.completed
    );
    
    const subjectGroups: Record<string, Task[]> = {};
    
    interleavableTasks.forEach(task => {
      const subject = task.subject || 'Uncategorized';
      if (!subjectGroups[subject]) {
        subjectGroups[subject] = [];
      }
      subjectGroups[subject].push(task);
    });
    
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
    
    const nonInterleavableTasks = tasks.filter(task => 
      !task.interleaving && !task.spacedRepetition
    );
    
    return [...interleaved, ...nonInterleavableTasks];
  }

  const dueTasksCount = tasks.filter(task => {
    if (task.completed) return false;
    if (!task.spacedRepetition?.nextReview) return false;
    return isAfter(new Date(), new Date(task.spacedRepetition.nextReview));
  }).length;
  
  const recurringTasksCount = tasks.filter(task => !!task.recurrence).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList className="p-1">
                <TabsTrigger value="matrix" className="flex items-center gap-2 px-4 py-2.5">
                  <Grid2X2 className="h-5 w-5" />
                  <span className="text-base font-medium">Eisenhower Matrix</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2 px-4 py-2.5">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-base font-medium">Analysis</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-lg shadow-sm border border-gray-100">
                <span className="text-base font-medium text-gray-600">Total Points:</span>
                <span className={`text-xl font-bold ${getPointsColor(totalPoints)}`}>{totalPoints}</span>
              </div>
            </div>
            
            <TabsContent value="matrix">
              <div className="flex flex-wrap gap-2 mb-6 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={showDueOnly ? "default" : "outline"}
                    onClick={() => {
                      setShowDueOnly(!showDueOnly);
                      if (!showDueOnly) setShowRecurringOnly(false);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-md"
                  >
                    <Brain className="h-4 w-4" />
                    <span>Due for Review ({dueTasksCount})</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={interleavingMode ? "default" : "outline"}
                    onClick={() => setInterleavingMode(!interleavingMode)}
                    className="flex items-center gap-1 px-4 py-2 rounded-md"
                  >
                    <Shuffle className="h-4 w-4" />
                    <span>Interleaving Mode</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={showRecurringOnly ? "default" : "outline"}
                    onClick={() => {
                      setShowRecurringOnly(!showRecurringOnly);
                      if (!showRecurringOnly) setShowDueOnly(false);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-md"
                  >
                    <Repeat className="h-4 w-4" />
                    <span>Recurring Tasks ({recurringTasksCount})</span>
                  </Button>
                </div>
                
                {(showDueOnly || interleavingMode || showRecurringOnly) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowDueOnly(false);
                      setInterleavingMode(false);
                      setShowRecurringOnly(false);
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
            </TabsContent>
            
            <TabsContent value="analysis">
              <TaskAnalysis tasks={tasks} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
