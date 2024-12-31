import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { posts } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get public posts
  app.get("/api/posts", async (_req, res) => {
    const allPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.isPublic, true))
      .orderBy(posts.createdAt);
    res.json(allPosts);
  });

  // Get all posts (requires auth)
  app.get("/api/admin/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authorized");
    }
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(posts.createdAt);
    res.json(allPosts);
  });

  // Create post (requires auth)
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authorized");
    }

    const { title, content, isPublic = true } = req.body;
    const newPost = await db
      .insert(posts)
      .values({
        title,
        content,
        isPublic,
        authorId: req.user!.id,
      })
      .returning();

    res.json(newPost[0]);
  });

  const httpServer = createServer(app);
  return httpServer;
}
