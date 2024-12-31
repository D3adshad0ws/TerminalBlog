import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';

interface TerminalInputProps {
  onSubmit: (command: string) => void;
}

export function TerminalInput({ onSubmit }: TerminalInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <div className="flex items-center">
      <span className="text-white mr-2">$</span>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-transparent border-none text-[rgb(40,254,20)] focus-visible:ring-0 placeholder:text-[rgb(40,254,20)]/50"
        placeholder="Type a command..."
      />
    </div>
  );
}
