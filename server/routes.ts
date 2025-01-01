import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { posts, tags, postTags, gameHistory } from "@db/schema";
import { eq, ilike, inArray, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Game score endpoints
  app.post("/api/scores", async (req, res) => {
    const { name, score } = req.body;
    if (!name || !score) {
      return res.status(400).json({ error: "Name and score are required" });
    }

    try {
      // Validate input
      if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: "Invalid score value" });
      }

      if (typeof name !== 'string' || name.length < 1 || name.length > 20) {
        return res.status(400).json({ error: "Name must be between 1 and 20 characters" });
      }

      const [entry] = await db.insert(gameHistory)
        .values({
          userId: 1, // Default user for anonymous scores
          score,
          enemiesDefeated: 0,
          survivalTime: 0,
          achievementsUnlocked: [],
        })
        .returning();

      res.json(entry);
    } catch (error) {
      console.error('Failed to save score:', error);
      res.status(500).json({ error: "Failed to save score" });
    }
  });

  app.get("/api/scores", async (_req, res) => {
    try {
      const scores = await db
        .select({
          id: gameHistory.id,
          score: gameHistory.score,
          playedAt: gameHistory.playedAt,
        })
        .from(gameHistory)
        .orderBy(desc(gameHistory.score))
        .limit(10);

      res.json(scores);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
      res.status(500).json({ error: "Failed to fetch scores" });
    }
  });

  // Get all tags
  app.get("/api/tags", async (_req, res) => {
    const allTags = await db
      .select()
      .from(tags)
      .orderBy(tags.name);
    res.json(allTags);
  });

  // Create tag (requires auth)
  app.post("/api/tags", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authorized");
    }

    const { name } = req.body;
    const [existingTag] = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);

    if (existingTag) {
      return res.status(400).send("Tag already exists");
    }

    const [newTag] = await db
      .insert(tags)
      .values({ name })
      .returning();

    res.json(newTag);
  });

  // Search posts by tag
  app.get("/api/posts/tagged/:tagName", async (req, res) => {
    const { tagName } = req.params;
    const taggedPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        isPublic: posts.isPublic,
        createdAt: posts.createdAt,
        tags: tags.name,
      })
      .from(posts)
      .leftJoin(postTags, eq(posts.id, postTags.postId))
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(posts.isPublic, true))
      .where(ilike(tags.name, `%${tagName}%`))
      .orderBy(posts.createdAt);

    res.json(taggedPosts);
  });

  // Get public posts with tags
  app.get("/api/posts", async (_req, res) => {
    const postsWithTags = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        isPublic: posts.isPublic,
        createdAt: posts.createdAt,
        tags: tags.name,
      })
      .from(posts)
      .leftJoin(postTags, eq(posts.id, postTags.postId))
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(posts.isPublic, true))
      .orderBy(posts.createdAt);

    const groupedPosts = postsWithTags.reduce((acc, curr) => {
      const { tags: tag, ...post } = curr;
      if (!acc[post.id]) {
        acc[post.id] = { ...post, tags: [] };
      }
      if (tag) {
        acc[post.id].tags.push(tag);
      }
      return acc;
    }, {} as Record<number, any>);

    res.json(Object.values(groupedPosts));
  });

  // Create post with tags (requires auth)
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authorized");
    }

    const { title, content, isPublic = true, tagNames = [] } = req.body;

    try {
      const [newPost] = await db
        .insert(posts)
        .values({
          title,
          content,
          isPublic,
          authorId: req.user!.id,
        })
        .returning();

      if (tagNames.length > 0) {
        const existingTags = await db
          .select()
          .from(tags)
          .where(inArray(tags.name, tagNames));

        const existingTagNames = existingTags.map(t => t.name);
        const newTagNames = tagNames.filter(name => !existingTagNames.includes(name));

        let allTags = existingTags;
        if (newTagNames.length > 0) {
          const newTags = await db
            .insert(tags)
            .values(newTagNames.map(name => ({ name })))
            .returning();
          allTags = [...existingTags, ...newTags];
        }

        await db
          .insert(postTags)
          .values(allTags.map(tag => ({
            postId: newPost.id,
            tagId: tag.id,
          })));

        const postWithTags = {
          ...newPost,
          tags: allTags.map(t => t.name),
        };
        res.json(postWithTags);
      } else {
        res.json({ ...newPost, tags: [] });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
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

  // Seed initial blog posts
  app.post("/api/seed", async (_req, res) => {
    const blogPosts = [
      {
        title: "Chinese State Sponsored Hack of United States Treasury Department",
        content: `Recent investigations have uncovered a sophisticated cyber attack targeting the U.S. Treasury Department. This analysis details the attack vectors, methodologies used, and implications for national security.

Key findings:
- Advanced persistent threat (APT) group identified
- Zero-day vulnerabilities exploited
- Data exfiltration methods analyzed
- Timeline of the attack
- Recommended security measures`,
        isPublic: true
      },
      {
        title: "25 Years of Chinese State Sponsored Hacks",
        content: `A comprehensive timeline of documented state-sponsored cyber operations from 1999 to 2024. This historical analysis reveals patterns, evolution of tactics, and growing sophistication of attacks.

Notable incidents:
- Early network infiltrations (1999-2005)
- Operation Aurora (2009)
- OPM Data Breach (2014-2015)
- Recent cloud-based attacks
- Evolution of tools and techniques`,
        isPublic: true
      },
      {
        title: "Advanced Persistent Threats: APAC & P.R.C.",
        content: `Deep dive into APT groups operating in the Asia-Pacific region, with focus on attribution, tactics, and targeted sectors.

Analysis includes:
- Known APT groups and their signatures
- Common attack vectors
- Target industry sectors
- Detection strategies
- Incident response protocols`,
        isPublic: true
      },
      {
        title: "Modern Security Tactics",
        content: `Contemporary approaches to cybersecurity defense, focusing on zero-trust architecture, AI-driven threat detection, and cloud security posture management.

Topics covered:
- Zero-trust implementation
- Cloud security architecture
- Endpoint detection and response
- Security orchestration
- Incident response automation`,
        isPublic: true
      },
      {
        title: "Deploying AI for Cybersecurity Defense",
        content: `Practical guide to implementing AI and machine learning in cybersecurity operations, from threat detection to automated response.

Key aspects:
- Machine learning models for threat detection
- Behavioral analysis systems
- Automated response mechanisms
- AI-driven security operations
- Future of AI in cybersecurity`,
        isPublic: true
      }
    ];

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, 'admin'))
        .limit(1);

      if (!user) {
        return res.status(500).send("Admin user not found");
      }

      for (const post of blogPosts) {
        await db.insert(posts).values({
          ...post,
          authorId: user.id,
        });
      }

      res.json({ message: "Blog posts seeded successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed blog posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}