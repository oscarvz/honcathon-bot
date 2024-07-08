ALTER TABLE "users_table" DROP CONSTRAINT "users_table_email_unique";--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN IF EXISTS "age";--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN IF EXISTS "email";