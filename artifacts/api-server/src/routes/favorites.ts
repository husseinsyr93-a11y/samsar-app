import { Router } from "express";
import { db } from "@workspace/db";
import { favoritesTable, propertiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddFavoriteBody } from "@workspace/api-zod";

const router = Router();

// GET /favorites
router.get("/favorites", async (_req, res) => {
  const favorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, 1));
  const propertyIds = favorites.map(f => f.propertyId);
  if (propertyIds.length === 0) return res.json([]);
  const properties = await Promise.all(
    propertyIds.map(id => db.select().from(propertiesTable).where(eq(propertiesTable.id, id)).then(r => r[0]))
  );
  return res.json(properties.filter(Boolean));
});

// POST /favorites
router.post("/favorites", async (req, res) => {
  const parsed = AddFavoriteBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const existing = await db.select().from(favoritesTable)
    .where(and(eq(favoritesTable.propertyId, parsed.data.propertyId), eq(favoritesTable.userId, 1)));
  if (existing.length > 0) return res.status(201).json(existing[0]);
  const [fav] = await db.insert(favoritesTable).values({ propertyId: parsed.data.propertyId, userId: 1 }).returning();
  return res.status(201).json(fav);
});

// DELETE /favorites/:propertyId
router.delete("/favorites/:propertyId", async (req, res) => {
  const propertyId = parseInt(req.params.propertyId);
  if (isNaN(propertyId)) return res.status(400).json({ error: "Invalid ID" });
  await db.delete(favoritesTable).where(and(eq(favoritesTable.propertyId, propertyId), eq(favoritesTable.userId, 1)));
  return res.status(204).send();
});

export default router;
