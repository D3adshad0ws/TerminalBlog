import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Command {
  command: string;
  output: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
}

interface GameState {
  isPlaying: boolean;
  game: 'guess' | 'hangman' | null;
  data: any;
}

export function useTerminal() {
  const [history, setHistory] = useState<Command[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    game: null,
    data: null,
  });

  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5000,
  });

  const processCommand = (input: string) => {
    const newCommand: Command = {
      command: input,
      output: handleCommand(input),
    };
    setHistory((prev) => [...prev, newCommand]);
  };

  const handleGuessGame = (input: string): string => {
    if (!gameState.isPlaying || gameState.game !== 'guess') {
      setGameState({
        isPlaying: true,
        game: 'guess',
        data: {
          number: Math.floor(Math.random() * 100) + 1,
          attempts: 0,
        },
      });
      return `Welcome to the Number Guessing Game!
I'm thinking of a number between 1 and 100.
Type a number to make your guess...`;
    }

    const guess = parseInt(input);
    const targetNumber = gameState.data.number;
    const attempts = gameState.data.attempts + 1;

    if (isNaN(guess)) {
      return 'Please enter a valid number.';
    }

    if (guess === targetNumber) {
      setGameState({ isPlaying: false, game: null, data: null });
      return `Congratulations! You've found the number ${targetNumber} in ${attempts} attempts!
Game Over. Type 'guess' to play again.`;
    }

    setGameState({
      ...gameState,
      data: { ...gameState.data, attempts },
    });

    if (guess < targetNumber) {
      return 'Higher...';
    }
    return 'Lower...';
  };

  const handleHangmanGame = (input: string): string => {
    const words = ['FIREWALL', 'MALWARE', 'ENCRYPTION', 'VULNERABILITY', 'EXPLOIT'];

    if (!gameState.isPlaying || gameState.game !== 'hangman') {
      const word = words[Math.floor(Math.random() * words.length)];
      setGameState({
        isPlaying: true,
        game: 'hangman',
        data: {
          word,
          guessed: new Set<string>(),
          remainingTries: 6,
        },
      });
      return `Welcome to Cybersecurity Hangman!
Guess the security-related term by typing one letter at a time.
You have 6 tries remaining.

${getHangmanDisplay(word, new Set<string>())}`;
    }

    const letter = input.toUpperCase();
    if (!/^[A-Z]$/.test(letter)) {
      return 'Please enter a single letter.';
    }

    const { word, guessed, remainingTries } = gameState.data;
    if (guessed.has(letter)) {
      return 'You already guessed that letter!';
    }

    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    const newRemainingTries = word.includes(letter) ? remainingTries : remainingTries - 1;

    const display = getHangmanDisplay(word, newGuessed);
    const isWon = !display.includes('_');

    setGameState({
      ...gameState,
      data: {
        word,
        guessed: newGuessed,
        remainingTries: newRemainingTries,
      },
    });

    if (isWon) {
      setGameState({ isPlaying: false, game: null, data: null });
      return `${display}

Congratulations! You've found the word: ${word}!
Game Over. Type 'hangman' to play again.`;
    }

    if (newRemainingTries === 0) {
      setGameState({ isPlaying: false, game: null, data: null });
      return `Game Over! The word was: ${word}
Type 'hangman' to play again.`;
    }

    return `${display}

You have ${newRemainingTries} tries remaining.`;
  };

  const getHangmanDisplay = (word: string, guessed: Set<string>): string => {
    return word
      .split('')
      .map(letter => guessed.has(letter) ? letter : '_')
      .join(' ');
  };

  const handleCommand = (input: string): string => {
    if (gameState.isPlaying) {
      switch (gameState.game) {
        case 'guess':
          return handleGuessGame(input);
        case 'hangman':
          return handleHangmanGame(input);
        default:
          return 'Unknown game state';
      }
    }

    const [command, ...args] = input.toLowerCase().trim().split(' ');

    switch (command) {
      case 'help':
        return `
Available commands:
- help: Show this help message
- clear: Clear terminal history
- about: Show about information
- blog: Show blog posts
- read <number>: Read a specific blog post
- contact: Show contact information

Easter Eggs:
- guess: Play a number guessing game
- hangman: Play hangman with cybersecurity terms
`;
      case 'clear':
        setHistory([]);
        return '';
      case 'about':
        return 'Welcome to my terminal-themed blog! This is a cybersecurity focused blog discussing various aspects of information security, state-sponsored attacks, and defense strategies.';
      case 'blog':
        if (!posts || posts.length === 0) {
          return 'No blog posts available.';
        }
        return posts.map((post, index) => 
          `<${index + 1}> ${post.title} (${new Date(post.createdAt).toLocaleDateString()})`
        ).join('\n');
      case 'read':
        const postNumber = parseInt(args[0]);
        if (isNaN(postNumber) || !posts || postNumber < 1 || postNumber > posts.length) {
          return 'Invalid blog post number. Use "blog" command to see available posts.';
        }
        const post = posts[postNumber - 1];
        return `
Title: ${post.title}
Date: ${new Date(post.createdAt).toLocaleDateString()}

${post.content}
`;
      case 'contact':
        return `Email: deadshadows@naver.com
GitHub: https://github.com/D3adshad0ws`;
      case 'guess':
        return handleGuessGame(input);
      case 'hangman':
        return handleHangmanGame(input);
      default:
        return `Command not found: ${input}. Type 'help' for available commands.`;
    }
  };

  return {
    history,
    processCommand,
  };
}