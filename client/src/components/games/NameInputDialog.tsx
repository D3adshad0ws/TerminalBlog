import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NameInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  score: number;
}

export const NameInputDialog = ({ isOpen, onClose, onSubmit, score }: NameInputDialogProps) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-[rgb(40,254,20)] text-[rgb(40,254,20)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono mb-4">New High Score!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center font-mono">
            <p className="text-2xl mb-2">Score: {score}</p>
            <p>Enter your name for the leaderboard:</p>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-[rgb(40,254,20)] text-[rgb(40,254,20)] font-mono"
            placeholder="Your name..."
            maxLength={20}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[rgb(40,254,20)] text-[rgb(40,254,20)] hover:bg-[rgb(40,254,20)]/10 font-mono"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[rgb(40,254,20)] text-black hover:bg-[rgb(20,200,10)] font-mono"
              disabled={!name.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
