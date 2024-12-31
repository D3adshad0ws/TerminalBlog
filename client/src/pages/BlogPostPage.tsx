import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";
import type { Post } from "@db/schema";

export function BlogPostPage() {
  const [, params] = useRoute<{ id: string }>("/post/:id");
  const postId = parseInt(params?.id || "0");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5000,
  });

  const post = posts?.find(p => p.id === postId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(40,254,20)]" />
      </div>
    );
  }

  if (!post) {
    return <div className="text-[rgb(40,254,20)] p-4">Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-[rgb(40,254,20)]">{post.title}</h1>
          <div className="text-[rgb(40,254,20)]">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <div className="text-[rgb(40,254,20)] whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>
    </div>
  );
}
