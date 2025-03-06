
import { useState } from "react";
import { Task, TaskQuadrant } from "@/types/task";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TaskItem from "@/components/TaskItem";
import TaskForm from "@/components/TaskForm";

interface QuadrantProps {
  title: string;
  description: string;
  quadrant: TaskQuadrant;
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const Quadrant = ({
  title,
  description,
  quadrant,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: QuadrantProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);

  const getQuadrantStyle = () => {
    switch (quadrant) {
      case "q1":
        return "border-t-4 border-t-matrix-q1 bg-matrix-q1bg";
      case "q2":
        return "border-t-4 border-t-matrix-q2 bg-matrix-q2bg";
      case "q3":
        return "border-t-4 border-t-matrix-q3 bg-matrix-q3bg";
      case "q4":
        return "border-t-4 border-t-matrix-q4 bg-matrix-q4bg";
      default:
        return "";
    }
  };

  const handleAddTask = (task: Omit<Task, "id">) => {
    onAddTask({
      ...task,
      quadrant,
      createdAt: new Date().toISOString(),
    });
    setIsAddingTask(false);
  };

  return (
    <Card className={`overflow-hidden ${getQuadrantStyle()}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAddingTask ? (
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setIsAddingTask(false)}
          />
        ) : null}
        
        <div className="space-y-2 mt-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-2 text-center">
              No tasks in this quadrant
            </p>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                quadrant={quadrant}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Quadrant;
