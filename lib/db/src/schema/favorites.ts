import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  userId: integer("user_id").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favoritesTable).omit({ id: true, createdAt: true, userId: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favoritesTable.$inferSelect;
