CREATE TYPE "public"."mission_level" AS ENUM('L1_cognitive', 'L2_home_action', 'L3_outside_action', 'L4_social_action');--> statement-breakpoint
CREATE TYPE "public"."mission_response" AS ENUM('accepted', 'declined', 'no_response');--> statement-breakpoint
CREATE TYPE "public"."mission_status" AS ENUM('completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."risk_action" AS ENUM('modal_shown', 'soft_check_in', 'escalated', 'none');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"event_type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mission_id" uuid NOT NULL,
	"assigned_for_date" date NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"response" "mission_response" DEFAULT 'no_response' NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mission_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"assignment_id" uuid,
	"mission_id" uuid NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text,
	"photo_url" text,
	"status" "mission_status" DEFAULT 'completed' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" "mission_level" NOT NULL,
	"category" text NOT NULL,
	"prompt" text NOT NULL,
	"expected_minutes" integer DEFAULT 5 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source" text NOT NULL,
	"severity" integer NOT NULL,
	"matched_keywords" jsonb,
	"llm_judgment" jsonb,
	"action" "risk_action" NOT NULL,
	"isolated_blob_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"age_verified" boolean DEFAULT false NOT NULL,
	"age_verified_at" timestamp with time zone,
	"locale" text DEFAULT 'ko-KR' NOT NULL,
	"preferred_mission_level" "mission_level" DEFAULT 'L1_cognitive' NOT NULL,
	"push_subscription" jsonb,
	"daily_push_hour" integer DEFAULT 9 NOT NULL,
	"timezone" text DEFAULT 'Asia/Seoul' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mission_assignments" ADD CONSTRAINT "mission_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_assignments" ADD CONSTRAINT "mission_assignments_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_logs" ADD CONSTRAINT "mission_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_logs" ADD CONSTRAINT "mission_logs_assignment_id_mission_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."mission_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_logs" ADD CONSTRAINT "mission_logs_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_events" ADD CONSTRAINT "risk_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mission_assignments_user_date_idx" ON "mission_assignments" USING btree ("user_id","assigned_for_date");--> statement-breakpoint
CREATE INDEX "mission_logs_user_completed_idx" ON "mission_logs" USING btree ("user_id","completed_at");--> statement-breakpoint
CREATE INDEX "risk_events_user_created_idx" ON "risk_events" USING btree ("user_id","created_at");