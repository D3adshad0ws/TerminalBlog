import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@db/schema";
import { useTerminal } from "@/hooks/use-terminal";

export function Navigation() {
  const [_, setLocation] = useLocation();
  const { resetTerminal } = useTerminal();

  const handleReset = () => {
    window.location.reload(); // Simply reload the page to reset everything
  };

  // We still fetch posts to maintain data consistency,
  // but we don't display them in the navigation anymore
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5000,
  });

  return (
    <div className="border-b border-[rgb(40,254,20)] bg-black p-4">
      <div className="container mx-auto">
        <Button
          onClick={handleReset}
          className="bg-transparent text-[rgb(40,254,20)] border-[rgb(40,254,20)] hover:bg-[rgb(40,254,20)] hover:text-black font-mono"
        >
          Reset Terminal
        </Button>
      </div>
    </div>
  );
}