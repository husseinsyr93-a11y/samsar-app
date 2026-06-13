import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const matchStatusEnum = pgEnum("match_status", ["pending", "matched", "rejected"]);

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  userId: integer("user_id").notNull().default(1),
  status: matchStatusEnum("status").notNull().default("pending"),
  action: text("action").notNull().default("like"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({ id: true, createdAt: true, userId: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
