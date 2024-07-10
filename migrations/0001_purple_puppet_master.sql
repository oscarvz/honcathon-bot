ALTER TABLE "scores_table" RENAME TO "ratings_table";--> statement-breakpoint
ALTER TABLE "ratings_table" DROP CONSTRAINT "scores_table_user_id_users_table_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings_table" ADD CONSTRAINT "ratings_table_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
