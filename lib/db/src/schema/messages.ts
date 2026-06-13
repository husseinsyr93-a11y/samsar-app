import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  propertyTitle: text("property_title"),
  propertyImage: text("property_image"),
  otherPartyName: text("other_party_name"),
  lastMessage: text("last_message").notNull().default(""),
  unreadCount: integer("unread_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  content: text("content").notNull(),
  isOwn: boolean("is_own").notNull().default(true),
  senderName: text("sender_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
export type Conversation = typeof conversationsTable.$inferSelect;
