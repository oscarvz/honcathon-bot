ALTER TABLE "scores_table" RENAME COLUMN "rated_by_slack_user_id" TO "rated_by_id";--> statement-breakpoint
ALTER TABLE "scores_table" DROP CONSTRAINT "scores_table_slack_user_id_unique";--> statement-breakpoint
ALTER TABLE "scores_table" DROP CONSTRAINT "scores_table_rated_by_slack_user_id_unique";--> statement-breakpoint
ALTER TABLE "users_table" DROP CONSTRAINT "users_table_slack_id_unique";--> statement-breakpoint
ALTER TABLE "scores_table" DROP CONSTRAINT "scores_table_user_id_users_table_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'scores_table'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "scores_table" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "scores_table" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'users_table'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "users_table" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "users_table" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scores_table" ADD CONSTRAINT "scores_table_id_users_table_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "scores_table" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "scores_table" DROP COLUMN IF EXISTS "slack_user_id";--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN IF EXISTS "slack_id";--> statement-breakpoint
ALTER TABLE "users_table" ADD CONSTRAINT "users_table_id_unique" UNIQUE("id");