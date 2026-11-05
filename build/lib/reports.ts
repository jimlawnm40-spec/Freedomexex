import { and, desc, eq, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { reports } from "../db/schema.js";

export const REPORT_TYPES = ["stolen", "damaged", "misrepresented"] as const;
export const CATEGORIES = [
  "phone", "laptop", "tablet", "bicycle", "vehicle", "tool", "camera",
  "jewelry", "electronics", "instrument", "other",
] as const;

export const MIN_IDENTIFIER_LENGTH = 4;

export function normalizeIdentifier(raw: unknown): string {
  return String(raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export function isOneOf<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value);
}

// Columns safe to expose publicly (excludes contact email).
export const publicColumns = {
  id: reports.id,
  identifier: reports.identifierDisplay,
  category: reports.category,
  brand: reports.brand,
  model: reports.model,
  reportType: reports.reportType,
  description: reports.description,
  location: reports.location,
  incidentDate: reports.incidentDate,
  status: reports.status,
  createdAt: reports.createdAt,
};

// Newest-first active reports, optionally narrowed by an extra condition.
export function activeReports(limit: number, where?: SQL) {
  return db
    .select(publicColumns)
    .from(reports)
    .where(and(eq(reports.status, "active"), where))
    .orderBy(desc(reports.createdAt))
    .limit(limit);
}
