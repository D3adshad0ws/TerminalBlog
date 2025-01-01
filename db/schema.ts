import { pgTable, text, serial, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  highScore: integer("high_score").default(0).notNull(),
  totalGamesPlayed: integer("total_games_played").default(0).notNull(),
  totalPlayTime: integer("total_play_time_seconds").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gameAchievements = pgTable("game_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(),
  enemiesDefeated: integer("enemies_defeated").notNull(),
  survivalTime: integer("survival_time_seconds").notNull(),
  achievementsUnlocked: json("achievements_unlocked").$type<string[]>(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  stats: many(playerStats),
  achievements: many(gameAchievements),
  history: many(gameHistory),
}));

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  user: one(users, {
    fields: [playerStats.userId],
    references: [users.id],
  }),
}));

export const gameAchievementsRelations = relations(gameAchievements, ({ one }) => ({
  user: one(users, {
    fields: [gameAchievements.userId],
    references: [users.id],
  }),
}));

export const gameHistoryRelations = relations(gameHistory, ({ one }) => ({
  user: one(users, {
    fields: [gameHistory.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertPlayerStatsSchema = createInsertSchema(playerStats);
export const selectPlayerStatsSchema = createSelectSchema(playerStats);
export const insertGameAchievementSchema = createInsertSchema(gameAchievements);
export const selectGameAchievementSchema = createSelectSchema(gameAchievements);
export const insertGameHistorySchema = createInsertSchema(gameHistory);
export const selectGameHistorySchema = createSelectSchema(gameHistory);
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PlayerStats = typeof playerStats.$inferSelect;
export type NewPlayerStats = typeof playerStats.$inferInsert;
export type GameAchievement = typeof gameAchievements.$inferSelect;
export type NewGameAchievement = typeof gameAchievements.$inferInsert;
export type GameHistory = typeof gameHistory.$inferSelect;
export type NewGameHistory = typeof gameHistory.$inferInsert;

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  authorId: serial("author_id").references(() => users.id),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
});

export const postTags = pgTable("post_tags", {
  postId: serial("post_id").references(() => posts.id),
  tagId: serial("tag_id").references(() => tags.id),
});