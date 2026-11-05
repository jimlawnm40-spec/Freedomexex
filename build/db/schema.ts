import { pgTable, serial, text, timestamp, date, index } from "drizzle-orm/pg-core";

// A report filed against a specific item, identified by its serial number / IMEI / VIN.
export const reports = pgTable(
  "reports",
  {
    id: serial().primaryKey(),
    // Normalized identifier: uppercase, alphanumerics only, used for lookups.
    identifier: text().notNull(),
    // Identifier exactly as the reporter typed it, for display.
    identifierDisplay: text("identifier_display").notNull(),
    category: text().notNull(),
    brand: text().notNull().default(""),
    model: text().notNull().default(""),
    // One of: stolen, damaged, misrepresented
    reportType: text("report_type").notNull(),
    description: text().notNull().default(""),
    location: text().notNull().default(""),
    incidentDate: date("incident_date"),
    // Private: never returned by the public API.
    contactEmail: text("contact_email").notNull().default(""),
    status: text().notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reports_identifier_idx").on(t.identifier)],
);
