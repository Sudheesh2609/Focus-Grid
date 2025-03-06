
import { useState } from "react";
import { ActiveRecallCard } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, CheckCircle, XCircle, Plus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActiveRecallProps {
  cards: ActiveRecallCard[];
  onUpdate: (cards: ActiveRecallCard[]) => void;
  className?: string;
}

const ActiveRecall = ({ cards, onUpdate, className = "" }: ActiveRecallProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  
  // Empty state or all cards completed
  if (cards.length === 0) {
    return (
      <div className={`bg-blue-50 p-4 rounded-md ${className}`}>
        <div className="text-center mb-4">
          <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-medium text-lg text-blue-700">Active Recall</h3>
          <p className="text-sm text-blue-600">Add your first flashcard to practice active recall</p>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleAddCard} className="space-y-3">
            <div>
              <Input
                placeholder="Question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="mb-2"
              />
              <Textarea
                placeholder="Answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={!newQuestion.trim() || !newAnswer.trim()}
              >
                Add Card
              </Button>
            </div>
          </form>
        ) : (
          <Button 
            className="w-full flex gap-2 items-center justify-center" 
            onClick={() => setIsEditing(true)}
          >
            <Plus size={16} />
            Add Flashcard
          </Button>
        )}
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  
  // Handle adding a new card
  function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    
    const newCards = [...cards, {
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      lastPerformance: null
    }];
    
    onUpdate(newCards);
    setNewQuestion("");
    setNewAnswer("");
    setIsEditing(false);
  }
  
  // Handle marking card as correct/incorrect
  function handleMarkCard(performance: 'correct' | 'incorrect') {
    const updatedCards = [...cards];
    updatedCards[currentIndex] = {
      ...currentCard,
      lastPerformance: performance
    };
    
    onUpdate(updatedCards);
    
    // Move to next card if available
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  }
  
  // Shuffle cards
  function handleShuffle() {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    onUpdate(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
  }
  
  // Reset and start over
  function handleReset() {
    setCurrentIndex(0);
    setShowAnswer(false);
  }
  
  // Handle navigation
  function handleNext() {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  }
  
  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  }

  return (
    <div className={`bg-blue-50 p-4 rounded-md ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium flex items-center gap-1">
          <Brain className="w-4 h-4" />
          <span>Active Recall</span>
          <Badge variant="outline" className="ml-2">
            {currentIndex + 1}/{cards.length}
          </Badge>
        </h3>
        
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleShuffle}
            title="Shuffle cards"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Cancel editing" : "Add new card"}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleAddCard} className="space-y-3 mb-3">
          <div>
            <Input
              placeholder="Question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="mb-2"
            />
            <Textarea
              placeholder="Answer"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={!newQuestion.trim() || !newAnswer.trim()}
            >
              Add Card
            </Button>
          </div>
        </form>
      ) : (
        <Card className="mb-3">
          <CardHeader className="py-3 px-4">
            <div className="font-medium">{currentCard.question}</div>
          </CardHeader>
          
          {showAnswer && (
            <CardContent className="py-3 px-4 border-t">
              <div className="whitespace-pre-wrap">{currentCard.answer}</div>
            </CardContent>
          )}
          
          <CardFooter className="flex justify-between py-2 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-1"
            >
              {showAnswer ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Hide Answer</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>Show Answer</span>
                </>
              )}
            </Button>
            
            {showAnswer && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkCard('incorrect')}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkCard('correct')}
                  className="text-green-500 hover:text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ActiveRecall;
