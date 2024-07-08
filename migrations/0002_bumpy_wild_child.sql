ALTER TABLE "scores_table" ADD COLUMN "slack_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scores_table" ADD COLUMN "rated_by_slack_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scores_table" ADD COLUMN "score" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "slack_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scores_table" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "scores_table" DROP COLUMN IF EXISTS "content";