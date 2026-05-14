ALTER TABLE "missions" ADD COLUMN "seed_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_seed_id_unique" UNIQUE("seed_id");