import { useState, useMemo } from "react";
import { Task, AnalysisPeriod, TaskAnalytics } from "@/types/task";
import {
  Card,
  CardContent,
  CardDescription,
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
  format,
} from "date-fns";
import { getPointsColor } from "@/utils/points";

interface TaskAnalysisProps {
  tasks: Task[];
}

const TaskAnalysis = ({ tasks }: TaskAnalysisProps) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<AnalysisPeriod>("weekly");

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

  const analytics = useMemo((): TaskAnalytics => {
    const range = getDateRange(period);
    
    const filteredTasks = tasks.filter((task) => {
      if (!task.completedAt) return false;
      
      const completedDate = parseISO(task.completedAt);
      return isWithinInterval(completedDate, {
        start: range.start,
        end: range.end,
      });
    });
    
    const pendingTasks = tasks.filter((task) => {
      if (task.completed) return false;
      
      const createdDate = parseISO(task.createdAt);
      return isWithinInterval(createdDate, {
        start: range.start,
        end: range.end,
      });
    }).length;
    
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
    
    return filteredTasks.reduce((analytics, task) => {
      const taskPoints = task.points || 0;
      analytics.totalPoints += taskPoints;
      
      analytics.pointsByQuadrant[task.quadrant] += taskPoints;
      
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

  const quadrantData = [
    {
      name: "Urgent & Important",
      points: analytics.pointsByQuadrant.q1,
      tasks: analytics.tasksByQuadrant.q1,
      color: "#ef4444",
    },
    {
      name: "Important & Not Urgent",
      points: analytics.pointsByQuadrant.q2,
      tasks: analytics.tasksByQuadrant.q2,
      color: "#3b82f6",
    },
    {
      name: "Urgent & Not Important",
      points: analytics.pointsByQuadrant.q3,
      tasks: analytics.tasksByQuadrant.q3,
      color: "#f59e0b",
    },
    {
      name: "Not Urgent & Not Important",
      points: analytics.pointsByQuadrant.q4,
      tasks: analytics.tasksByQuadrant.q4,
      color: "#6b7280",
    },
  ];

  const dateRange = useMemo(() => {
    const range = getDateRange(period);
    return {
      start: format(range.start, 'MMM d'),
      end: format(range.end, 'MMM d, yyyy')
    };
  }, [period]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Task Analysis</h2>
          <p className="text-gray-500">{dateRange.start} - {dateRange.end}</p>
        </div>
        <Select
          value={period}
          onValueChange={(value) => handlePeriodChange(value as AnalysisPeriod)}
        >
          <SelectTrigger className="w-[180px] bg-white">
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
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-gray-600">
              <Trophy className="mr-2 h-5 w-5 text-amber-500" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getPointsColor(analytics.totalPoints)}`}>
              {analytics.totalPoints}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-gray-600">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{analytics.completedTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-gray-600">
              <Clock className="mr-2 h-5 w-5 text-orange-500" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{analytics.pendingTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-gray-600">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 capitalize">{period}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
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
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: 'none'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="points" name="Points" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {quadrantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Tasks by Quadrant</CardTitle>
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
                    outerRadius={110}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="tasks"
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {quadrantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: 'none'
                    }}
                  />
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
