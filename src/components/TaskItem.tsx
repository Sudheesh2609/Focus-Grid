
import { useState } from "react";
import { Task, TaskQuadrant } from "@/types/task";
import { Pencil, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TaskForm from "@/components/TaskForm";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  quadrant: TaskQuadrant;
}

const TaskItem = ({ task, onUpdate, onDelete, quadrant }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleComplete = () => {
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
    <div className={`flex items-start gap-2 p-3 rounded-md bg-white shadow-sm border transition-all ${task.completed ? 'opacity-70' : ''}`}>
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
