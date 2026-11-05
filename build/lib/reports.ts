import { reports } from "../db/schema.js";

export const REPORT_TYPES = ["stolen", "damaged", "misrepresented"] as const;
export const CATEGORIES = [
  "phone", "laptop", "tablet", "bicycle", "vehicle", "tool", "camera",
  "jewelry", "electronics", "instrument", "other",
] as const;

export function normalizeIdentifier(raw: unknown): string {
  return String(raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
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

export function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}
