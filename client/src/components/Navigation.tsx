import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Post } from "@db/schema";

export function Navigation() {
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5000,
  });

  return (
    <div className="border-b border-[rgb(40,254,20)] bg-black p-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-[rgb(40,254,20)] border-[rgb(40,254,20)] hover:bg-[rgb(40,254,20)] hover:text-black">
              Blog Posts
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[400px] bg-black border border-[rgb(40,254,20)] p-4">
                <div className="grid gap-3">
                  {posts?.map((post) => (
                    <Link 
                      key={post.id} 
                      href={`/post/${post.id}`}
                      className="block p-2 hover:bg-[rgb(40,254,20)] hover:text-black text-[rgb(40,254,20)]"
                    >
                      {post.title}
                    </Link>
                  ))}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
