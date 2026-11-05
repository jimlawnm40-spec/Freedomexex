import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { reports } from "../../db/schema.js";
import { MIN_IDENTIFIER_LENGTH, activeReports, normalizeIdentifier } from "../../lib/reports.js";

export default async (req: Request) => {
  const identifier = normalizeIdentifier(new URL(req.url).searchParams.get("id"));
  if (identifier.length < MIN_IDENTIFIER_LENGTH) {
    return Response.json(
      { error: `Enter a serial number, IMEI or VIN of at least ${MIN_IDENTIFIER_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const matches = await activeReports(50, eq(reports.identifier, identifier));
  return Response.json({ identifier, flagged: matches.length > 0, reports: matches });
};

export const config: Config = { path: "/api/check", method: "GET" };
