import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const apps = pgTable("apps", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  category: text("category").notNull(), // games | apps | arcade | developer
  genre: text("genre").notNull().default(""),
  description: text("description").notNull().default(""),
  color1: text("color1").notNull().default("#007AFF"),
  color2: text("color2").notNull().default("#5AC8FA"),
  icon: text("icon").notNull().default("Sparkles"),
  rating: real("rating").notNull().default(4.7),
  ratings: integer("ratings").notNull().default(1200),
  size: text("size").notNull().default("64 MB"),
  age: text("age").notNull().default("4+"),
  version: text("version").notNull().default("1.0.0"),
  developer: text("developer").notNull().default("N Space Labs"),
  changelog: text("changelog").notNull().default(""),
  badge: text("badge"),
  url: text("url"),
  source: text("source").notNull().default("catalog"), // catalog | github
  status: text("status").notNull().default("available"), // available | installed | update
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull().default({}),
});

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default("New chat"),
  pinnedRepoId: text("pinned_repo_id"),
  branch: text("branch").notNull().default("main"),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  blocks: jsonb("blocks").$type<unknown[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
