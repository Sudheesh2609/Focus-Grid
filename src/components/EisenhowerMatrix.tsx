
import { useState } from "react";
import { Task, TaskQuadrant } from "@/types/task";
import Quadrant from "@/components/Quadrant";

interface EisenhowerMatrixProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const EisenhowerMatrix = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: EisenhowerMatrixProps) => {
  // Filter tasks by quadrant
  const q1Tasks = tasks.filter((task) => task.quadrant === "q1");
  const q2Tasks = tasks.filter((task) => task.quadrant === "q2");
  const q3Tasks = tasks.filter((task) => task.quadrant === "q3");
  const q4Tasks = tasks.filter((task) => task.quadrant === "q4");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Quadrant
        title="Urgent & Important"
        description="Do First"
        quadrant="q1"
        tasks={q1Tasks}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
      
      <Quadrant
        title="Important & Not Urgent"
        description="Schedule"
        quadrant="q2"
        tasks={q2Tasks}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
      
      <Quadrant
        title="Urgent & Not Important"
        description="Delegate"
        quadrant="q3"
        tasks={q3Tasks}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
      
      <Quadrant
        title="Not Urgent & Not Important"
        description="Eliminate"
        quadrant="q4"
        tasks={q4Tasks}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};

export default EisenhowerMatrix;
