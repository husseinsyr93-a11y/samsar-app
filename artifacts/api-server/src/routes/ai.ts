import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable } from "@workspace/db";
import { lte, gte, and, eq, type SQL } from "drizzle-orm";
import { GetAiRecommendationsBody, GeneratePropertyDescriptionBody } from "@workspace/api-zod";

const router = Router();

// POST /ai/recommend
router.post("/ai/recommend", async (req, res) => {
  const parsed = GetAiRecommendationsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const { budget, familySize, hasChildren, hasCar, needsSchool, needsMosque, preferredCity, rooms } = parsed.data;

  const conditions: SQL[] = [lte(propertiesTable.rent, budget), eq(propertiesTable.status, "available")];
  if (rooms != null) conditions.push(gte(propertiesTable.rooms, rooms));
  if (preferredCity) conditions.push(eq(propertiesTable.city, preferredCity));
  if (needsMosque) conditions.push(eq(propertiesTable.nearMosque, true));
  if (needsSchool) conditions.push(eq(propertiesTable.nearSchool, true));

  let items = await db.select().from(propertiesTable).where(and(...conditions)).limit(10);

  // If strict filters yield nothing, relax
  if (items.length === 0) {
    items = await db.select().from(propertiesTable)
      .where(and(lte(propertiesTable.rent, budget + 300), eq(propertiesTable.status, "available")))
      .limit(10);
  }

  return res.json(items);
});

// POST /ai/describe
router.post("/ai/describe", async (req, res) => {
  const parsed = GeneratePropertyDescriptionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, parsed.data.propertyId));
  if (!property) return res.status(404).json({ error: "Property not found" });

  const arabic = `شقة ${property.rooms} غرفة${property.rooms !== 1 ? "" : ""} فاخرة في ${property.city}، ${property.district || "موقع مميز"}. المساحة ${property.area} متر مربع، الطابق ${property.floor || 1} من أصل ${property.totalFloors || 5} طوابق. الإيجار ${property.rent}€ شهرياً. ${property.nearStation ? "قريبة من المواصلات العامة. " : ""}${property.nearMosque ? "قريبة من المسجد. " : ""}${property.nearSchool ? "قريبة من المدارس. " : ""}عقار مثالي للعائلات.`;
  const german = parsed.data.language !== "ar"
    ? `Schöne ${property.rooms}-Zimmer-Wohnung in ${property.city}, ${property.district || "zentrale Lage"}. ${property.area} m², ${property.floor || 1}. Etage. Miete: ${property.rent}€/Monat. ${property.nearStation ? "Öffentliche Verkehrsmittel in der Nähe. " : ""}Ideale Lage für Familien.`
    : null;

  return res.json({ arabic, german });
});

export default router;
