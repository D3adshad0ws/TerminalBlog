import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
}

interface GameState {
  player: GameObject;
  ingredients: GameObject[];
  obstacles: GameObject[];
  score: number;
  gameOver: boolean;
}

export const TteokbokkiGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    player: { x: 50, y: 200, width: 30, height: 30 },
    ingredients: [],
    obstacles: [],
    score: 0,
    gameOver: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (gameState.gameOver) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw player (Chef)
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(gameState.player.x, gameState.player.y, 30, 30);
      
      // Draw ingredients (Tteok)
      ctx.fillStyle = '#FFF';
      gameState.ingredients.forEach(ingredient => {
        ctx.fillRect(ingredient.x, ingredient.y, 20, 10);
      });
      
      // Draw obstacles (Pots)
      ctx.fillStyle = '#4A4A4A';
      gameState.obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, 40, 40);
      });
      
      // Draw score
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.fillText(`Tteok collected: ${gameState.score}`, 10, 30);
      
      requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;
      
      const newPlayer = { ...gameState.player };
      const speed = 10;
      
      switch (e.key) {
        case 'ArrowUp':
          newPlayer.y = Math.max(0, newPlayer.y - speed);
          break;
        case 'ArrowDown':
          newPlayer.y = Math.min(canvas.height - newPlayer.height, newPlayer.y + speed);
          break;
        case 'ArrowLeft':
          newPlayer.x = Math.max(0, newPlayer.x - speed);
          break;
        case 'ArrowRight':
          newPlayer.x = Math.min(canvas.width - newPlayer.width, newPlayer.x + speed);
          break;
      }
      
      setGameState(prev => ({ ...prev, player: newPlayer }));
    };

    // Start game loop
    gameLoop();
    
    // Add keyboard controls
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState]);

  const startGame = () => {
    setGameState({
      player: { x: 50, y: 200, width: 30, height: 30 },
      ingredients: Array.from({ length: 5 }, () => ({
        x: Math.random() * (canvasRef.current?.width || 400 - 20),
        y: Math.random() * (canvasRef.current?.height || 400 - 10),
        width: 20,
        height: 10
      })),
      obstacles: Array.from({ length: 3 }, () => ({
        x: Math.random() * (canvasRef.current?.width || 400 - 40),
        y: Math.random() * (canvasRef.current?.height || 400 - 40),
        width: 40,
        height: 40
      })),
      score: 0,
      gameOver: false
    });
  };

  return (
    <Card className="p-4 max-w-xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2">Tteokbokki Chef</h2>
        <p className="text-sm text-gray-600 mb-4">
          Collect the rice cakes (white rectangles) while avoiding the hot pots!
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border-2 border-gray-300 rounded-lg mb-4 mx-auto"
      />
      <div className="text-center">
        <Button onClick={startGame} className="mt-2">
          {gameState.gameOver ? 'Try Again' : 'Start Game'}
        </Button>
      </div>
    </Card>
  );
};
