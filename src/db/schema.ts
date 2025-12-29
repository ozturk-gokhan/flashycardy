import { integer, pgTable, varchar, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Decks table (collections of flashcards)
export const decksTable = pgTable("decks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cards table (individual flashcards)
export const cardsTable = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  deckId: uuid("deck_id").references(() => decksTable.id, { onDelete: "cascade" }).notNull(),
  difficulty: integer("difficulty").default(0), // 0-5 scale
  nextReview: timestamp("next_review").defaultNow(),
  repetitions: integer("repetitions").default(0),
  easeFactor: integer("ease_factor").default(250), // SM-2 algorithm
  interval: integer("interval").default(1), // days
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Study sessions table
export const studySessionsTable = pgTable("study_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
  deckId: uuid("deck_id").references(() => decksTable.id).notNull(),
  cardsStudied: integer("cards_studied").default(0),
  correctAnswers: integer("correct_answers").default(0),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

// Define relationships
export const decksRelations = relations(decksTable, ({ many }) => ({
  cards: many(cardsTable),
  studySessions: many(studySessionsTable),
}));

export const cardsRelations = relations(cardsTable, ({ one }) => ({
  deck: one(decksTable, {
    fields: [cardsTable.deckId],
    references: [decksTable.id],
  }),
}));

export const studySessionsRelations = relations(studySessionsTable, ({ one }) => ({
  deck: one(decksTable, {
    fields: [studySessionsTable.deckId],
    references: [decksTable.id],
  }),
}));

// Type exports for TypeScript
export type Deck = typeof decksTable.$inferSelect;
export type NewDeck = typeof decksTable.$inferInsert;
export type Card = typeof cardsTable.$inferSelect;
export type NewCard = typeof cardsTable.$inferInsert;
export type StudySession = typeof studySessionsTable.$inferSelect;
export type NewStudySession = typeof studySessionsTable.$inferInsert;
