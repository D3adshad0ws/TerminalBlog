import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { TerminalInput } from './TerminalInput';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalProps {
  history: Array<{ command: string; output: string }>;
  onCommand: (command: string) => void;
}

export function Terminal({ history, onCommand }: TerminalProps) {
  const [_, setLocation] = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (command: string) => {
    const output = processCommand(command);
    onCommand(command);
    return output;
  };

  const processCommand = (command: string) => {
    switch (command.toLowerCase()) {
      case 'help':
        return `Available commands:
- help: Show this help message
- clear: Clear the terminal
- tteokbokki: Launch Tteokbokki Space Battle
- kart: Launch Cyber Kart Rider
- exit: Exit current game (if in a game)`;
      case 'tteokbokki':
        setLocation('/easter-egg/tteokbokki');
        return 'Launching Tteokbokki Space Battle...';
      case 'kart':
        setLocation('/easter-egg/kart-rider');
        return 'Launching Cyber Kart Rider...';
      default:
        return 'Unknown command. Type "help" for available commands.';
    }
  };

  return (
    <div className="w-full h-full bg-black text-[rgb(40,254,20)] font-mono p-4 rounded-none border border-[rgb(40,254,20)]">
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2">
          <div className="mb-4">
            Welcome to the Terminal Blog! Type 'help' for available commands.
          </div>

          {history.map((entry, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center">
                <span className="text-white">$</span>
                <span className="ml-2">{entry.command}</span>
              </div>
              <div className="whitespace-pre-wrap">{entry.output}</div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="mt-4">
        <TerminalInput onSubmit={handleCommand} />
      </div>
    </div>
  );
}