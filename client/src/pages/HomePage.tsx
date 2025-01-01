import { Terminal } from '@/components/Terminal';
import { useTerminal } from '@/hooks/use-terminal';
import { Navigation } from '@/components/Navigation';

export function HomePage() {
  const { history, processCommand, resetTerminal } = useTerminal();

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="container mx-auto p-4">
        <Terminal 
          history={history}
          onCommand={processCommand}
        />
      </div>
    </div>
  );
}