import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const ratings = pgTable("ratings_table", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ratedById: text("rated_by_id").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  receiver: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
}));
