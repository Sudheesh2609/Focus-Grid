
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import EisenhowerMatrix from "@/components/EisenhowerMatrix";
import { Task, TaskQuadrant } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Initialize with localStorage if available
    const savedTasks = localStorage.getItem("eisenhowerTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("eisenhowerTasks", JSON.stringify(tasks));
  }, [tasks]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <EisenhowerMatrix 
          tasks={tasks} 
          onAddTask={addTask} 
          onUpdateTask={updateTask} 
          onDeleteTask={deleteTask} 
        />
      </main>
    </div>
  );
};

export default Index;
