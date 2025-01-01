import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { TteokbokkiGameMenu } from './TteokbokkiGameMenu';
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { audioManager } from '@/lib/audio';
import { useMutation } from '@tanstack/react-query';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
  direction?: number;
  isActive?: boolean;
  type?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  type: 'score' | 'enemies' | 'survival';
  unlocked: boolean;
  icon: string;
}

interface GameState {
  player: GameObject;
  enemies: GameObject[];
  bullets: GameObject[];
  score: number;
  gameOver: boolean;
  enemiesDefeated: number;
  survivalTime: number;
  achievements: Achievement[];
}

const ENEMY_TYPES = [
  { type: 'tteokbokki', color: '#ff4444' },
  { type: 'ramen', color: '#ffa500' },
  { type: 'dumpling', color: '#ffeb3b' },
  { type: 'sushi', color: '#4caf50' }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'score_1000',
    name: 'Spicy Novice',
    description: 'Score 1,000 points',
    requirement: 1000,
    type: 'score',
    unlocked: false,
    icon: '🌶️'
  },
  {
    id: 'score_5000',
    name: 'Tteokbokki Master',
    description: 'Score 5,000 points',
    requirement: 5000,
    type: 'score',
    unlocked: false,
    icon: '🏆'
  },
  {
    id: 'enemies_10',
    name: 'Food Fighter',
    description: 'Defeat 10 enemies',
    requirement: 10,
    type: 'enemies',
    unlocked: false,
    icon: '⚔️'
  },
  {
    id: 'enemies_50',
    name: 'Kitchen Commander',
    description: 'Defeat 50 enemies',
    requirement: 50,
    type: 'enemies',
    unlocked: false,
    icon: '👑'
  },
  {
    id: 'survival_60',
    name: 'Minute Master',
    description: 'Survive for 60 seconds',
    requirement: 60,
    type: 'survival',
    unlocked: false,
    icon: '⏱️'
  }
];

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

export const TteokbokkiGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    player: { x: CANVAS_WIDTH / 2 - 15, y: CANVAS_HEIGHT - 50, width: 30, height: 30 },
    enemies: [],
    bullets: [],
    score: 0,
    gameOver: false,
    enemiesDefeated: 0,
    survivalTime: 0,
    achievements: INITIAL_ACHIEVEMENTS
  });
  const [location, setLocation] = useState('/');

  const submitScore = useMutation({
    mutationFn: async ({ score }: { score: number }) => {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      });
      if (!res.ok) {
        throw new Error('Failed to submit score');
      }
      return res.json();
    },
  });

  const checkAchievements = () => {
    const updatedAchievements = gameState.achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let requirementMet = false;
      switch (achievement.type) {
        case 'score':
          requirementMet = gameState.score >= achievement.requirement;
          break;
        case 'enemies':
          requirementMet = gameState.enemiesDefeated >= achievement.requirement;
          break;
        case 'survival':
          requirementMet = gameState.survivalTime >= achievement.requirement;
          break;
      }

      if (requirementMet && !achievement.unlocked) {
        toast({
          title: `Achievement Unlocked!`,
          description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
          duration: 3000
        });
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });

    if (JSON.stringify(updatedAchievements) !== JSON.stringify(gameState.achievements)) {
      setGameState(prev => ({ ...prev, achievements: updatedAchievements }));
    }
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: GameObject) => {
    const enemyType = ENEMY_TYPES.find(t => t.type === enemy.type) || ENEMY_TYPES[0];
    ctx.fillStyle = enemyType.color;

    switch (enemy.type) {
      case 'tteokbokki':
        ctx.beginPath();
        ctx.roundRect(
          enemy.x + 5,
          enemy.y,
          enemy.width - 10,
          enemy.height,
          8
        );
        ctx.fill();

        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.moveTo(enemy.x + 5, enemy.y + (enemy.height * i / 4));
          ctx.lineTo(enemy.x + enemy.width - 5, enemy.y + (enemy.height * i / 4));
          ctx.stroke();
        }

        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(enemy.x + 10 + (i * 10), enemy.y);
          ctx.lineTo(enemy.x + 15 + (i * 10), enemy.y + 10);
          ctx.stroke();
        }

        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        break;

      case 'ramen':
        ctx.beginPath();
        ctx.ellipse(
          enemy.x + enemy.width/2,
          enemy.y + enemy.height/2,
          enemy.width/2,
          enemy.height/3,
          0,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(enemy.x + 5 + i * 10, enemy.y + 10);
          ctx.bezierCurveTo(
            enemy.x + 5 + i * 10,
            enemy.y + 20,
            enemy.x + 15 + i * 10,
            enemy.y + 15,
            enemy.x + 15 + i * 10,
            enemy.y + 25
          );
          ctx.stroke();
        }
        break;

      case 'dumpling':
        ctx.beginPath();
        ctx.arc(
          enemy.x + enemy.width/2,
          enemy.y + enemy.height/2,
          enemy.width/2,
          0.25 * Math.PI,
          0.75 * Math.PI,
          true
        );
        ctx.fill();
        break;

      case 'sushi':
        ctx.fillRect(enemy.x, enemy.y + enemy.height/4, enemy.width, enemy.height/2);
        ctx.fillStyle = '#000';
        ctx.fillRect(
          enemy.x,
          enemy.y + enemy.height/3,
          enemy.width,
          enemy.height/6
        );
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showMenu) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    let gameStartTime = performance.now();
    const BULLET_SPEED = 7;
    const ENEMY_SPEED = 2;

    const gameLoop = (timestamp: number) => {
      if (gameState.gameOver) {
        if (gameState.score > highScore) {
          setHighScore(gameState.score);
          submitScore.mutate(
            { score: gameState.score },
            {
              onSuccess: () => {
                toast({
                  title: "Score submitted!",
                  description: "Your score has been added to the leaderboard.",
                });
              },
              onError: (error) => {
                toast({
                  title: "Error",
                  description: "Failed to submit score. Please try again.",
                  variant: "destructive",
                });
                console.error('Score submission error:', error);
              },
            }
          );
        }
        setShowMenu(true);
        return;
      }

      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      const currentSurvivalTime = Math.floor((timestamp - gameStartTime) / 1000);
      if (currentSurvivalTime !== gameState.survivalTime) {
        setGameState(prev => ({ ...prev, survivalTime: currentSurvivalTime }));
      }

      checkAchievements();

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const updatedBullets = gameState.bullets.filter(bullet => {
        bullet.y -= BULLET_SPEED;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(bullet.x, bullet.y, 3, 8);
        return bullet.y > 0;
      });

      const updatedEnemies = gameState.enemies.map(enemy => {
        enemy.x += Math.sin(timestamp * 0.002) * 2;
        enemy.y += ENEMY_SPEED;
        drawEnemy(ctx, enemy);
        return enemy;
      }).filter(enemy => enemy.y < canvas.height);

      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.moveTo(gameState.player.x + gameState.player.width/2, gameState.player.y);
      ctx.lineTo(gameState.player.x + gameState.player.width, gameState.player.y + gameState.player.height);
      ctx.lineTo(gameState.player.x, gameState.player.y + gameState.player.height);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = '#0000ff';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (const enemy of updatedEnemies) {
        if (checkCollision(gameState.player, enemy)) {
          setGameState(prev => ({ ...prev, gameOver: true }));
          return;
        }

        for (const bullet of updatedBullets) {
          if (checkCollision(bullet, enemy)) {
            audioManager.playSound('explosion');
            bullet.isActive = false;
            enemy.isActive = false;
            setGameState(prev => ({ ...prev, score: prev.score + 100, enemiesDefeated: prev.enemiesDefeated + 1 }));
          }
        }
      }

      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 24px "Courier New"';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${gameState.score}`, 10, 30);
      ctx.font = 'bold 16px "Courier New"';
      ctx.fillText(`Time: ${currentSurvivalTime}s`, 10, 55);
      ctx.fillText(`Enemies: ${gameState.enemiesDefeated}`, 10, 80);

      const unlockedAchievements = gameState.achievements.filter(a => a.unlocked);
      unlockedAchievements.forEach((achievement, index) => {
        ctx.fillText(`${achievement.icon}`, CANVAS_WIDTH - 30 - (index * 30), 30);
      });


      if (timestamp % 1000 < 20 && updatedEnemies.length < 5) {
        const randomType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)].type;
        updatedEnemies.push({
          x: Math.random() * (canvas.width - 30),
          y: 0,
          width: 30,
          height: 30,
          isActive: true,
          type: randomType
        });
      }

      setGameState(prev => ({
        ...prev,
        enemies: updatedEnemies.filter(e => e.isActive !== false),
        bullets: updatedBullets.filter(b => b.isActive !== false)
      }));

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;

      const newPlayer = { ...gameState.player };
      const speed = 12.5;

      switch (e.key) {
        case 'ArrowLeft':
          newPlayer.x = Math.max(0, newPlayer.x - speed);
          break;
        case 'ArrowRight':
          newPlayer.x = Math.min(canvas.width - newPlayer.width, newPlayer.x + speed);
          break;
        case ' ':
          audioManager.playSound('shoot');
          setGameState(prev => ({
            ...prev,
            bullets: [...prev.bullets, {
              x: newPlayer.x + newPlayer.width/2 - 1.5,
              y: newPlayer.y,
              width: 3,
              height: 8,
              isActive: true
            }]
          }));
          break;
      }

      setGameState(prev => ({ ...prev, player: newPlayer }));
    };

    window.addEventListener('keydown', handleKeyPress);
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameState, showMenu, highScore]);

  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  };

  const startGame = () => {
    audioManager.playBGM();
    setGameState({
      player: { x: CANVAS_WIDTH / 2 - 15, y: CANVAS_HEIGHT - 50, width: 30, height: 30 },
      enemies: [],
      bullets: [],
      score: 0,
      gameOver: false,
      enemiesDefeated: 0,
      survivalTime: 0,
      achievements: INITIAL_ACHIEVEMENTS
    });
    setShowMenu(false);
  };

  const resetGame = () => {
    audioManager.stopBGM();
    setGameState(prev => ({ ...prev, gameOver: true }));
    setShowMenu(true);
    setLocation('/');
  };


  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      {showMenu ? (
        <TteokbokkiGameMenu
          onStartGame={startGame}
          onResetGame={resetGame}
          highScore={highScore}
          achievements={gameState.achievements}
        />
      ) : (
        <Card className="p-4 bg-black border-[rgb(40,254,20)]">
          <canvas
            ref={canvasRef}
            className="border-2 border-[rgb(40,254,20)] rounded-lg bg-black"
          />
        </Card>
      )}
    </div>
  );
};