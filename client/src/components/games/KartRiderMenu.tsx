import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GameMenuProps {
  onStartGame: () => void;
  onResetGame: () => void;
  highScore: number;
}

export const KartRiderMenu = ({
  onStartGame,
  onResetGame,
  highScore,
}: GameMenuProps) => {
  return (
    <Card className="p-6 max-w-xl mx-auto bg-black border-[rgb(40,254,20)] text-[rgb(40,254,20)]">
      <h1 className="text-3xl font-bold text-center mb-6 font-mono">
        CYBER KART RIDER
      </h1>

      <div className="space-y-4">
        <div className="text-center font-mono">
          <p className="text-xl font-semibold">HIGH SCORE: {highScore}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full bg-[rgb(40,254,20)] text-black hover:bg-[rgb(20,200,10)] font-mono"
            onClick={onStartGame}
          >
            START RACE
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-[rgb(40,254,20)] text-[rgb(40,254,20)] hover:bg-[rgb(40,254,20)]/10 font-mono"
              >
                RACE MANUAL
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-[rgb(40,254,20)] text-[rgb(40,254,20)]">
              <DialogHeader>
                <DialogTitle className="font-mono">CYBER KART MANUAL</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[300px] w-full p-4">
                <div className="space-y-4 font-mono">
                  <section>
                    <h3 className="font-bold mb-2">OBJECTIVE</h3>
                    <p>Navigate through the cyber highway avoiding obstacles and survive as long as possible!</p>
                  </section>

                  <section>
                    <h3 className="font-bold mb-2">CONTROLS</h3>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>← LEFT ARROW: Move to left lane</li>
                      <li>→ RIGHT ARROW: Move to right lane</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-bold mb-2">SCORING</h3>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Score increases as you survive longer</li>
                      <li>Collision with obstacles ends the race</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-bold mb-2">TIPS</h3>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Watch for patterns in obstacle spawns</li>
                      <li>Plan your lane changes ahead</li>
                      <li>Stay focused on upcoming obstacles</li>
                    </ul>
                  </section>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button
            variant="secondary"
            size="lg"
            className="w-full bg-transparent border-[rgb(40,254,20)] text-[rgb(40,254,20)] hover:bg-[rgb(40,254,20)]/10 font-mono"
            onClick={onResetGame}
          >
            EXIT RACE
          </Button>
        </div>
      </div>
    </Card>
  );
};
