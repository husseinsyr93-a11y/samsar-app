import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq, and, type SQL } from "drizzle-orm";
import { ListReviewsQueryParams, CreateReviewBody } from "@workspace/api-zod";

const router = Router();

// GET /reviews
router.get("/reviews", async (req, res) => {
  const parsed = ListReviewsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  const conditions: SQL[] = [];
  if (parsed.data.propertyId != null) conditions.push(eq(reviewsTable.propertyId, parsed.data.propertyId));
  if (parsed.data.neighborhoodId != null) conditions.push(eq(reviewsTable.neighborhoodId, parsed.data.neighborhoodId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const items = await db.select().from(reviewsTable).where(where).orderBy(reviewsTable.createdAt);
  return res.json(items);
});

// POST /reviews
router.post("/reviews", async (req, res) => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [review] = await db.insert(reviewsTable).values({ ...parsed.data, authorName: "مستخدم", isVerified: false }).returning();
  return res.status(201).json(review);
});

export default router;
