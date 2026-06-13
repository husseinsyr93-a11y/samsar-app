import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id"),
  neighborhoodId: integer("neighborhood_id"),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull().default("مستخدم"),
  authorAvatar: text("author_avatar"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
