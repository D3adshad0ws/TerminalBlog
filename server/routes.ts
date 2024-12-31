import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { posts } from "@db/schema";
import { eq } from "drizzle-orm";
import {users} from "@db/schema" // Added import for users table

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