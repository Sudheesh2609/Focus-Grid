
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Eisenhower Matrix</h1>
          <p className="text-sm text-gray-500">Prioritize your tasks effectively</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About Eisenhower Matrix</DialogTitle>
              <DialogDescription>
                <div className="mt-4 space-y-4">
                  <p>
                    The Eisenhower Matrix is a productivity tool that helps you prioritize 
                    tasks by urgency and importance, dividing them into four quadrants:
                  </p>
                  
                  <div className="space-y-2">
                    <p className="font-semibold text-matrix-q1">Quadrant 1: Urgent & Important</p>
                    <p className="text-sm pl-4">Tasks that need immediate attention. Do these first.</p>
                    
                    <p className="font-semibold text-matrix-q2">Quadrant 2: Important & Not Urgent</p>
                    <p className="text-sm pl-4">Tasks that are important but not urgent. Schedule these.</p>
                    
                    <p className="font-semibold text-matrix-q3">Quadrant 3: Urgent & Not Important</p>
                    <p className="text-sm pl-4">Tasks that are urgent but not important. Delegate if possible.</p>
                    
                    <p className="font-semibold text-matrix-q4">Quadrant 4: Not Urgent & Not Important</p>
                    <p className="text-sm pl-4">Tasks that are neither urgent nor important. Eliminate these when possible.</p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
