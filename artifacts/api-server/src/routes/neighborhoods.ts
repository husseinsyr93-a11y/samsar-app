import { Router } from "express";
import { db } from "@workspace/db";
import { neighborhoodsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListNeighborhoodsQueryParams } from "@workspace/api-zod";

const router = Router();

// GET /neighborhoods
router.get("/neighborhoods", async (req, res) => {
  const parsed = ListNeighborhoodsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  if (parsed.data.city) {
    const items = await db.select().from(neighborhoodsTable).where(eq(neighborhoodsTable.city, parsed.data.city));
    return res.json(items);
  }
  const items = await db.select().from(neighborhoodsTable);
  return res.json(items);
});

// GET /neighborhoods/:id
router.get("/neighborhoods/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [neighborhood] = await db.select().from(neighborhoodsTable).where(eq(neighborhoodsTable.id, id));
  if (!neighborhood) return res.status(404).json({ error: "Not found" });
  return res.json(neighborhood);
});

export default router;
