
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
    <header className="bg-white border-b border-gray-200 py-6">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
            <div className="grid grid-cols-2 grid-rows-2 w-8 h-8 gap-1">
              <div className="bg-white opacity-90 rounded-sm"></div>
              <div className="bg-white opacity-70 rounded-sm"></div>
              <div className="bg-white opacity-70 rounded-sm"></div>
              <div className="bg-white opacity-50 rounded-sm"></div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Focus Grid</h1>
            <p className="text-sm text-gray-500">Prioritize your tasks effectively</p>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <Info className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">About Focus Grid</DialogTitle>
              <DialogDescription>
                <div className="mt-4 space-y-4">
                  <p>
                    Focus Grid helps you prioritize tasks using the Eisenhower Matrix - 
                    a productivity method dividing tasks into four quadrants:
                  </p>
                  
                  <div className="space-y-3 mt-4">
                    <div className="p-3 rounded-md bg-matrix-q1bg">
                      <p className="font-semibold text-matrix-q1">Quadrant 1: Urgent & Important</p>
                      <p className="text-sm pl-2">Tasks that need immediate attention. Do these first.</p>
                    </div>
                    
                    <div className="p-3 rounded-md bg-matrix-q2bg">
                      <p className="font-semibold text-matrix-q2">Quadrant 2: Important & Not Urgent</p>
                      <p className="text-sm pl-2">Tasks that are important but not urgent. Schedule these.</p>
                    </div>
                    
                    <div className="p-3 rounded-md bg-matrix-q3bg">
                      <p className="font-semibold text-matrix-q3">Quadrant 3: Urgent & Not Important</p>
                      <p className="text-sm pl-2">Tasks that are urgent but not important. Delegate if possible.</p>
                    </div>
                    
                    <div className="p-3 rounded-md bg-matrix-q4bg">
                      <p className="font-semibold text-matrix-q4">Quadrant 4: Not Urgent & Not Important</p>
                      <p className="text-sm pl-2">Tasks that are neither urgent nor important. Eliminate these when possible.</p>
                    </div>
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
