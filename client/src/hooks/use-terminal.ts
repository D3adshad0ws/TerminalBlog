import { useState } from 'react';

interface Command {
  command: string;
  output: string;
}

export function useTerminal() {
  const [history, setHistory] = useState<Command[]>([]);

  const processCommand = (input: string) => {
    const newCommand: Command = {
      command: input,
      output: handleCommand(input),
    };
    setHistory((prev) => [...prev, newCommand]);
  };

  const handleCommand = (input: string): string => {
    const command = input.toLowerCase().trim();

    switch (command) {
      case 'help':
        return `
Available commands:
- help: Show this help message
- clear: Clear terminal history
- about: Show about information
- blog: Show blog posts
- contact: Show contact information
`;
      case 'clear':
        setHistory([]);
        return '';
      case 'about':
        return 'Welcome to my terminal-themed blog!';
      case 'contact':
        return 'Email: example@example.com\nGitHub: @example';
      default:
        return `Command not found: ${input}. Type 'help' for available commands.`;
    }
  };

  return {
    history,
    processCommand,
  };
}
