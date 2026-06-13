import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable } from "@workspace/db";
import { eq, gte, lte, and, type SQL, desc, sql } from "drizzle-orm";
import {
  ListPropertiesQueryParams,
  CreatePropertyBody,
  UpdatePropertyBody,
} from "@workspace/api-zod";

const router = Router();

// GET /properties
router.get("/properties", async (req, res) => {
  const parsed = ListPropertiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }
  const { city, type, minRent, maxRent, rooms, page = 1, limit = 20, featured } = parsed.data;
  const conditions: SQL[] = [];
  if (city) conditions.push(eq(propertiesTable.city, city));
  if (type) conditions.push(eq(propertiesTable.type, type as any));
  if (minRent != null) conditions.push(gte(propertiesTable.rent, minRent));
  if (maxRent != null) conditions.push(lte(propertiesTable.rent, maxRent));
  if (rooms != null) conditions.push(gte(propertiesTable.rooms, rooms));
  if (featured === true) conditions.push(sql`${propertiesTable.tier} != 'basic'`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = ((page ?? 1) - 1) * (limit ?? 20);

  const [items, countResult] = await Promise.all([
    db.select().from(propertiesTable).where(where).orderBy(desc(propertiesTable.createdAt)).limit(limit ?? 20).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(where),
  ]);

  return res.json({ items, total: Number(countResult[0].count), page: page ?? 1, limit: limit ?? 20 });
});

// POST /properties
router.post("/properties", async (req, res) => {
  const parsed = CreatePropertyBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [property] = await db.insert(propertiesTable).values(parsed.data).returning();
  return res.status(201).json(property);
});

// GET /properties/stats/summary
router.get("/properties/stats/summary", async (_req, res) => {
  const [total, available, avgRentResult, cities, newThisWeek] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(propertiesTable),
    db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(eq(propertiesTable.status, "available")),
    db.select({ avg: sql<number>`avg(rent)` }).from(propertiesTable),
    db.select({ count: sql<number>`count(distinct city)` }).from(propertiesTable),
    db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(sql`created_at > now() - interval '7 days'`),
  ]);
  return res.json({
    totalListings: Number(total[0].count),
    availableListings: Number(available[0].count),
    avgRent: Math.round(Number(avgRentResult[0].avg) || 0),
    citiesCount: Number(cities[0].count),
    newThisWeek: Number(newThisWeek[0].count),
    totalMatches: 0,
    totalUsers: 1,
  });
});

// GET /properties/cities/distribution
router.get("/properties/cities/distribution", async (_req, res) => {
  const result = await db
    .select({
      city: propertiesTable.city,
      count: sql<number>`count(*)`,
      avgRent: sql<number>`avg(rent)`,
    })
    .from(propertiesTable)
    .groupBy(propertiesTable.city)
    .orderBy(desc(sql`count(*)`));
  return res.json(result.map(r => ({ city: r.city, count: Number(r.count), avgRent: Math.round(Number(r.avgRent) || 0) })));
});

// GET /properties/featured
router.get("/properties/featured", async (_req, res) => {
  const items = await db
    .select()
    .from(propertiesTable)
    .where(sql`${propertiesTable.tier} != 'basic'`)
    .orderBy(desc(propertiesTable.createdAt))
    .limit(8);
  return res.json(items);
});

// GET /properties/:id
router.get("/properties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
  if (!property) return res.status(404).json({ error: "Not found" });
  // Increment view count
  await db.update(propertiesTable).set({ viewCount: property.viewCount + 1 }).where(eq(propertiesTable.id, id));
  return res.json(property);
});

// GET /properties/:id/score
router.get("/properties/:id/score", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
  if (!property) return res.status(404).json({ error: "Not found" });

  // Calculate AI score based on property attributes
  const price = property.rent < 800 ? 90 : property.rent < 1200 ? 75 : property.rent < 1800 ? 60 : 45;
  const location = property.nearStation ? 85 : 65;
  const transport = property.nearStation ? 88 : 60;
  const safety = 72 + Math.floor(Math.random() * 15);
  const schools = property.nearSchool ? 90 : 55;
  const internet = 78;
  const services = (property.nearSupermarket ? 10 : 0) + (property.nearMosque ? 10 : 0) + 60;
  const total = Math.round((price + location + transport + safety + schools + internet + services) / 7);

  return res.json({ total, price, location, transport, safety, schools, internet, services, summary: "تقييم جيد للعقار بناءً على الموقع والخدمات المتاحة" });
});

// PATCH /properties/:id
router.patch("/properties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const parsed = UpdatePropertyBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [updated] = await db.update(propertiesTable).set(parsed.data).where(eq(propertiesTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

// DELETE /properties/:id
router.delete("/properties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
  return res.status(204).send();
});

export default router;
