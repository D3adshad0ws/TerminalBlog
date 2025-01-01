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
import { Progress } from "@/components/ui/progress";

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  type: 'score' | 'enemies' | 'survival';
  unlocked: boolean;
  icon: string;
}

interface GameMenuProps {
  onStartGame: () => void;
  onResetGame: () => void;
  highScore: number;
  achievements?: Achievement[];
}

export const TteokbokkiGameMenu = ({
  onStartGame,
  onResetGame,
  highScore,
  achievements = []
}: GameMenuProps) => {
  return (
    <Card className="p-6 max-w-xl mx-auto bg-black border-[rgb(40,254,20)] text-[rgb(40,254,20)]">
      <h1 className="text-3xl font-bold text-center mb-6 font-mono">
        TTEOKBOKKI SPACE BATTLE
      </h1>

      <div className="space-y-4">
        <div className="text-center font-mono">
          <p className="text-xl font-semibold">HIGH SCORE: {highScore}</p>
        </div>

        {achievements.length > 0 && (
          <div className="mb-4 p-4 border border-[rgb(40,254,20)] rounded-lg">
            <h3 className="text-lg font-mono mb-2">Achievements</h3>
            <div className="grid grid-cols-2 gap-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-2 border rounded ${
                    achievement.unlocked
                      ? 'border-[rgb(40,254,20)] bg-[rgb(40,254,20)]/10'
                      : 'border-[rgb(40,254,20)]/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="font-mono text-sm">{achievement.name}</p>
                      <p className="text-xs opacity-70">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full bg-[rgb(40,254,20)] text-black hover:bg-[rgb(20,200,10)] font-mono"
            onClick={onStartGame}
          >
            LAUNCH MISSION
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-[rgb(40,254,20)] text-[rgb(40,254,20)] hover:bg-[rgb(40,254,20)]/10 font-mono"
              >
                BATTLE MANUAL
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-[rgb(40,254,20)] text-[rgb(40,254,20)]">
              <DialogHeader>
                <DialogTitle className="font-mono">SPACE BATTLE MANUAL</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[300px] w-full p-4">
                <div className="space-y-4 font-mono">
                  <section>
                    <h3 className="font-bold mb-2">MISSION OBJECTIVE</h3>
                    <p>Defend against the invading Tteokbokki space fleet! These spicy rice cake vessels must be stopped!</p>
                  </section>

                  <section>
                    <h3 className="font-bold mb-2">CONTROLS</h3>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>← LEFT ARROW: Move ship left</li>
                      <li>→ RIGHT ARROW: Move ship right</li>
                      <li>SPACEBAR: Fire weapon</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-bold mb-2">SCORING</h3>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Each enemy vessel destroyed: +100 points</li>
                      <li>Collision with enemy vessel: Mission Failed</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-bold mb-2">ACHIEVEMENTS</h3>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Unlock special badges by reaching score milestones</li>
                      <li>Defeat enemies to earn combat achievements</li>
                      <li>Survive longer to prove your endurance</li>
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
            ABORT MISSION
          </Button>
        </div>
      </div>
    </Card>
  );
};