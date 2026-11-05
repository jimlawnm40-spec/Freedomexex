import type { Config } from "@netlify/functions";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { reports } from "../../db/schema.js";
import { normalizeIdentifier, publicColumns } from "../../lib/reports.js";

export default async (req: Request) => {
  const identifier = normalizeIdentifier(new URL(req.url).searchParams.get("id"));
  if (identifier.length < 4) {
    return Response.json({ error: "Enter a serial number, IMEI or VIN of at least 4 characters." }, { status: 400 });
  }

  const matches = await db
    .select(publicColumns)
    .from(reports)
    .where(and(eq(reports.identifier, identifier), eq(reports.status, "active")))
    .orderBy(desc(reports.createdAt))
    .limit(50);

  return Response.json({ identifier, flagged: matches.length > 0, reports: matches });
};

export const config: Config = { path: "/api/check", method: "GET" };
