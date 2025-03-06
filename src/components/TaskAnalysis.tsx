
import { useState, useMemo } from "react";
import { Task, AnalysisPeriod, TaskAnalytics } from "@/types/task";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Trophy,
  Calendar,
  BarChart as BarChartIcon,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  endOfDay,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
} from "date-fns";

interface TaskAnalysisProps {
  tasks: Task[];
}

const TaskAnalysis = ({ tasks }: TaskAnalysisProps) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<AnalysisPeriod>("weekly");

  // Get date range based on selected period
  const getDateRange = (period: AnalysisPeriod) => {
    const now = new Date();
    
    switch (period) {
      case "daily":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case "weekly":
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case "monthly":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "yearly":
        return {
          start: startOfYear(now),
          end: endOfYear(now),
        };
    }
  };

  // Filter tasks based on date range and calculate analytics
  const analytics = useMemo((): TaskAnalytics => {
    const range = getDateRange(period);
    
    // Filter tasks that were completed within the date range
    const filteredTasks = tasks.filter((task) => {
      if (!task.completedAt) return false;
      
      const completedDate = parseISO(task.completedAt);
      return isWithinInterval(completedDate, {
        start: range.start,
        end: range.end,
      });
    });
    
    // Count pending tasks within the date range
    const pendingTasks = tasks.filter((task) => {
      if (task.completed) return false;
      
      const createdDate = parseISO(task.createdAt);
      return isWithinInterval(createdDate, {
        start: range.start,
        end: range.end,
      });
    }).length;
    
    // Initial analytics structure
    const initialAnalytics: TaskAnalytics = {
      completedTasks: filteredTasks.length,
      pendingTasks,
      totalPoints: 0,
      pointsByQuadrant: {
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
      },
      tasksByQuadrant: {
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
      },
    };
    
    // Calculate analytics from filtered tasks
    return filteredTasks.reduce((analytics, task) => {
      // Add task points to total
      const taskPoints = task.points || 0;
      analytics.totalPoints += taskPoints;
      
      // Add task points by quadrant
      analytics.pointsByQuadrant[task.quadrant] += taskPoints;
      
      // Count tasks by quadrant
      analytics.tasksByQuadrant[task.quadrant]++;
      
      return analytics;
    }, initialAnalytics);
  }, [tasks, period]);

  const handlePeriodChange = (value: AnalysisPeriod) => {
    setPeriod(value);
    
    toast({
      title: "Analysis period updated",
      description: `Showing ${value} task analysis`,
    });
  };

  // Prepare data for charts
  const quadrantData = [
    {
      name: "Urgent & Important",
      points: analytics.pointsByQuadrant.q1,
      tasks: analytics.tasksByQuadrant.q1,
      color: "#ef4444", // Red for Q1
    },
    {
      name: "Important & Not Urgent",
      points: analytics.pointsByQuadrant.q2,
      tasks: analytics.tasksByQuadrant.q2,
      color: "#3b82f6", // Blue for Q2
    },
    {
      name: "Urgent & Not Important",
      points: analytics.pointsByQuadrant.q3,
      tasks: analytics.tasksByQuadrant.q3,
      color: "#f59e0b", // Yellow for Q3
    },
    {
      name: "Not Urgent & Not Important",
      points: analytics.pointsByQuadrant.q4,
      tasks: analytics.tasksByQuadrant.q4,
      color: "#6b7280", // Gray for Q4
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Analysis</h2>
        <Select
          value={period}
          onValueChange={(value) => handlePeriodChange(value as AnalysisPeriod)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="mr-2 h-4 w-4 text-amber-500" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPoints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-orange-500" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
              Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{period}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChartIcon className="mr-2 h-5 w-5" />
              Points by Quadrant
            </CardTitle>
            <CardDescription>
              Distribution of points across task categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={quadrantData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" name="Points" fill="#3b82f6">
                    {quadrantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Quadrant</CardTitle>
            <CardDescription>
              Distribution of tasks across the Eisenhower matrix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quadrantData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="tasks"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {quadrantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskAnalysis;
