import { pgTable, serial, text, integer, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertyTypeEnum = pgEnum("property_type", ["apartment", "house", "room", "studio", "office", "commercial"]);
export const propertyStatusEnum = pgEnum("property_status", ["available", "rented", "reserved"]);
export const propertyTierEnum = pgEnum("property_tier", ["basic", "featured", "gold", "platinum"]);

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  city: text("city").notNull(),
  district: text("district"),
  address: text("address").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  rent: integer("rent").notNull(),
  deposit: integer("deposit"),
  rooms: real("rooms").notNull(),
  area: real("area").notNull(),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  type: propertyTypeEnum("type").notNull().default("apartment"),
  status: propertyStatusEnum("status").notNull().default("available"),
  tier: propertyTierEnum("tier").notNull().default("basic"),
  amenities: text("amenities").array().notNull().default([]),
  images: text("images").array().notNull().default([]),
  ownerName: text("owner_name"),
  ownerPhone: text("owner_phone"),
  isVerified: boolean("is_verified").notNull().default(false),
  nearMosque: boolean("near_mosque").notNull().default(false),
  nearSchool: boolean("near_school").notNull().default(false),
  nearSupermarket: boolean("near_supermarket").notNull().default(false),
  nearStation: boolean("near_station").notNull().default(false),
  aiScore: integer("ai_score"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true, createdAt: true, viewCount: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
