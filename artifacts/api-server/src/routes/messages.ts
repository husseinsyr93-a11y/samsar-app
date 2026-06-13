import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";

const router = Router();

// GET /messages
router.get("/messages", async (_req, res) => {
  const conversations = await db.select().from(conversationsTable).orderBy(conversationsTable.createdAt);
  return res.json(conversations);
});

// GET /messages/:conversationId
router.get("/messages/:conversationId", async (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  if (isNaN(conversationId)) return res.status(400).json({ error: "Invalid ID" });
  const messages = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(messagesTable.createdAt);
  return res.json(messages);
});

// POST /messages/:conversationId
router.post("/messages/:conversationId", async (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  if (isNaN(conversationId)) return res.status(400).json({ error: "Invalid ID" });
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [message] = await db.insert(messagesTable)
    .values({ conversationId, content: parsed.data.content, isOwn: true, senderName: "أنت" })
    .returning();
  // Update last message in conversation
  await db.update(conversationsTable)
    .set({ lastMessage: parsed.data.content, unreadCount: 0 })
    .where(eq(conversationsTable.id, conversationId));
  return res.status(201).json(message);
});

export default router;
