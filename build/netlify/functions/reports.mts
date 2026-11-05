import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { reports } from "../../db/schema.js";
import { CATEGORIES, REPORT_TYPES, clean, normalizeIdentifier, publicColumns } from "../../lib/reports.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async (req: Request) => {
  if (req.method === "GET") {
    const recent = await db
      .select(publicColumns)
      .from(reports)
      .where(eq(reports.status, "active"))
      .orderBy(desc(reports.createdAt))
      .limit(12);
    return Response.json({ reports: recent });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const identifierDisplay = clean(body.identifier, 64);
  const identifier = normalizeIdentifier(identifierDisplay);
  const category = clean(body.category, 32);
  const reportType = clean(body.reportType, 32);
  const contactEmail = clean(body.contactEmail, 254);
  const incidentDate = clean(body.incidentDate, 10);
  const description = clean(body.description, 2000);

  const errors: string[] = [];
  if (identifier.length < 4) errors.push("Serial number / IMEI / VIN must have at least 4 letters or digits.");
  if (!(CATEGORIES as readonly string[]).includes(category)) errors.push("Choose an item category.");
  if (!(REPORT_TYPES as readonly string[]).includes(reportType)) errors.push("Choose a report type.");
  if (description.length < 10) errors.push("Describe what happened (at least 10 characters).");
  if (contactEmail && !EMAIL_RE.test(contactEmail)) errors.push("Contact email looks invalid.");
  if (incidentDate && (!DATE_RE.test(incidentDate) || isNaN(Date.parse(incidentDate)))) errors.push("Incident date is invalid.");
  if (errors.length) return Response.json({ error: errors.join(" ") }, { status: 400 });

  const [created] = await db
    .insert(reports)
    .values({
      identifier,
      identifierDisplay,
      category,
      reportType,
      description,
      brand: clean(body.brand, 80),
      model: clean(body.model, 80),
      location: clean(body.location, 120),
      incidentDate: incidentDate || null,
      contactEmail,
    })
    .returning(publicColumns);

  return Response.json({ report: created }, { status: 201 });
};

export const config: Config = { path: "/api/reports", method: ["GET", "POST"] };
