import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable, favoritesTable, matchesTable, reviewsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router = Router();

// GET /stats/dashboard
router.get("/stats/dashboard", async (_req, res) => {
  const [total, active, matches, reviews, featured] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(propertiesTable),
    db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(sql`status = 'available'`),
    db.select({ count: sql<number>`count(*)` }).from(matchesTable),
    db.select({ count: sql<number>`count(*)` }).from(reviewsTable),
    db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(sql`tier != 'basic'`),
  ]);
  return res.json({
    totalUsers: 142,
    totalProperties: Number(total[0].count),
    activeListings: Number(active[0].count),
    totalMatches: Number(matches[0].count),
    monthlyRevenue: 4850,
    newUsersThisMonth: 38,
    pendingReports: 3,
    featuredListings: Number(featured[0].count),
  });
});

// GET /stats/recent-activity
router.get("/stats/recent-activity", async (_req, res) => {
  const properties = await db.select().from(propertiesTable).orderBy(desc(propertiesTable.createdAt)).limit(5);
  const activity = properties.map(p => ({
    id: p.id,
    type: "new_listing" as const,
    description: `New listing: ${p.title}`,
    descriptionAr: `إعلان جديد: ${p.titleAr}`,
    icon: "🏠",
    createdAt: p.createdAt.toISOString(),
  }));
  return res.json(activity);
});

export default router;
