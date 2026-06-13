import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const neighborhoodsTable = pgTable("neighborhoods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  city: text("city").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  safety: integer("safety").notNull().default(0),
  cleanliness: integer("cleanliness").notNull().default(0),
  quiet: integer("quiet").notNull().default(0),
  transport: integer("transport").notNull().default(0),
  arabCommunity: integer("arab_community").notNull().default(0),
  schools: integer("schools").notNull().default(0),
  employment: integer("employment").notNull().default(0),
  overallScore: integer("overall_score").notNull().default(0),
  avgRent: integer("avg_rent"),
  propertiesCount: integer("properties_count").notNull().default(0),
  reviewsCount: integer("reviews_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNeighborhoodSchema = createInsertSchema(neighborhoodsTable).omit({ id: true, createdAt: true });
export type InsertNeighborhood = z.infer<typeof insertNeighborhoodSchema>;
export type Neighborhood = typeof neighborhoodsTable.$inferSelect;
