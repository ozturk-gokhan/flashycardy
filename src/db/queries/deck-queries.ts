import { db } from '@/lib/db';
import { decksTable, cardsTable, type Deck, type NewDeck } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Get user's decks with optional filters
export async function getUserDecks(userId: string, options?: {
  limit?: number;
  includeCardCount?: boolean;
}) {
  if (!options?.includeCardCount) {
    return await db.select()
      .from(decksTable)
      .where(eq(decksTable.userId, userId))
      .orderBy(desc(decksTable.updatedAt))
      .limit(options?.limit ?? 50);
  }

  // With card count
  return await db.select({
    id: decksTable.id,
    title: decksTable.title,
    description: decksTable.description,
    isPublic: decksTable.isPublic,
    createdAt: decksTable.createdAt,
    updatedAt: decksTable.updatedAt,
    userId: decksTable.userId,
    cardCount: sql<number>`count(${cardsTable.id})`.mapWith(Number),
  })
  .from(decksTable)
  .leftJoin(cardsTable, eq(cardsTable.deckId, decksTable.id))
  .where(eq(decksTable.userId, userId))
  .groupBy(decksTable.id)
  .orderBy(desc(decksTable.updatedAt))
  .limit(options?.limit ?? 50);
}

// Get user's decks with cards (for flashcards page)
export async function getUserDecksWithCards(userId: string, options?: {
  limit?: number;
}) {
  return await db.query.decksTable.findMany({
    where: eq(decksTable.userId, userId),
    with: {
      cards: true,
    },
    orderBy: (decks, { desc }) => [desc(decks.createdAt)],
    limit: options?.limit ?? 50,
  });
}

// Get single deck with ownership verification
export async function getUserDeck(deckId: string, userId: string) {
  const deck = await db.query.decksTable.findFirst({
    where: and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ),
  });

  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  return deck;
}

// Get single deck with cards and ownership verification
export async function getUserDeckWithCards(deckId: string, userId: string) {
  const deck = await db.query.decksTable.findFirst({
    where: and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ),
    with: {
      cards: {
        orderBy: (cards, { desc }) => [desc(cards.createdAt)],
      },
    },
  });

  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  return deck;
}

// Verify deck ownership (helper for other operations)
export async function verifyDeckOwnership(deckId: string, userId: string): Promise<boolean> {
  const deck = await db.query.decksTable.findFirst({
    where: and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ),
  });
  return deck !== undefined;
}

// Create new deck
export async function createDeck(data: Omit<NewDeck, 'createdAt' | 'updatedAt'>) {
  const [newDeck] = await db.insert(decksTable)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newDeck;
}

// Update deck with ownership verification
export async function updateDeck(
  deckId: string, 
  userId: string, 
  updates: Partial<Pick<Deck, 'title' | 'description' | 'isPublic'>>
) {
  const [updatedDeck] = await db.update(decksTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();

  if (!updatedDeck) {
    throw new Error('Deck not found or access denied');
  }

  return updatedDeck;
}

// Delete deck with ownership verification
export async function deleteDeck(deckId: string, userId: string) {
  const deletedDeck = await db.delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();

  if (deletedDeck.length === 0) {
    throw new Error('Deck not found or access denied');
  }

  return deletedDeck[0];
}

// TypeScript types for query parameters
export type DeckQueryOptions = {
  limit?: number;
  includeCardCount?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
};

export type DeckWithCardCount = Deck & {
  cardCount: number;
};

export type DeckUpdates = Partial<Pick<Deck, 'title' | 'description' | 'isPublic'>>;
