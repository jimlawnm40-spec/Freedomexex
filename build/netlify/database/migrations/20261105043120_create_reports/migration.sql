CREATE TABLE "reports" (
	"id" serial PRIMARY KEY,
	"identifier" text NOT NULL,
	"identifier_display" text NOT NULL,
	"category" text NOT NULL,
	"brand" text DEFAULT '' NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"report_type" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"incident_date" date,
	"contact_email" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "reports_identifier_idx" ON "reports" ("identifier");