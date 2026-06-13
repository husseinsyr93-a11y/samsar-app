import { Router } from "express";
import { db } from "@workspace/db";
import { matchesTable, propertiesTable } from "@workspace/db";
import { eq, and, notInArray } from "drizzle-orm";
import { CreateMatchBody } from "@workspace/api-zod";

const router = Router();

// GET /matches
router.get("/matches", async (_req, res) => {
  const matches = await db.select().from(matchesTable).where(eq(matchesTable.userId, 1));
  const result = await Promise.all(
    matches.map(async m => {
      const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, m.propertyId));
      return { ...m, property: property || null };
    })
  );
  return res.json(result);
});

// POST /matches
router.post("/matches", async (req, res) => {
  const parsed = CreateMatchBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const status = parsed.data.action === "like" ? "matched" : "rejected";
  const existing = await db.select().from(matchesTable)
    .where(and(eq(matchesTable.propertyId, parsed.data.propertyId), eq(matchesTable.userId, 1)));
  if (existing.length > 0) {
    const [updated] = await db.update(matchesTable).set({ status, action: parsed.data.action })
      .where(eq(matchesTable.id, existing[0].id)).returning();
    return res.status(201).json(updated);
  }
  const [match] = await db.insert(matchesTable).values({ propertyId: parsed.data.propertyId, userId: 1, status, action: parsed.data.action }).returning();
  return res.status(201).json(match);
});

// GET /matches/suggestions
router.get("/matches/suggestions", async (_req, res) => {
  const seen = await db.select({ propertyId: matchesTable.propertyId }).from(matchesTable).where(eq(matchesTable.userId, 1));
  const seenIds = seen.map(s => s.propertyId);
  let query = db.select().from(propertiesTable).limit(10);
  if (seenIds.length > 0) {
    const items = await db.select().from(propertiesTable).where(notInArray(propertiesTable.id, seenIds)).limit(10);
    return res.json(items);
  }
  const items = await query;
  return res.json(items);
});

export default router;
