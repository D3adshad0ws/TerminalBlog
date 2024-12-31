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

export function useTerminal() {
  const [history, setHistory] = useState<Command[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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

  const handleCommand = (input: string): string => {
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
      default:
        return `Command not found: ${input}. Type 'help' for available commands.`;
    }
  };

  return {
    history,
    processCommand,
  };
}