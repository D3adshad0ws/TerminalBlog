import { Terminal } from '@/components/Terminal';
import { useTerminal } from '@/hooks/use-terminal';

export function HomePage() {
  const { history, processCommand } = useTerminal();

  return (
    <div className="container mx-auto p-4 h-screen">
      <Terminal 
        history={history}
        onCommand={processCommand}
      />
    </div>
  );
}
