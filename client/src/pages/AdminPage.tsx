import { Terminal } from '@/components/Terminal';
import { useTerminal } from '@/hooks/use-terminal';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';

export function AdminPage() {
  const { history, processCommand } = useTerminal();
  const { logout } = useUser();

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => logout()}
          variant="outline"
          className="text-[rgb(40,254,20)] border-[rgb(40,254,20)]"
        >
          Logout
        </Button>
      </div>
      
      <Terminal 
        history={history}
        onCommand={processCommand}
      />
    </div>
  );
}
