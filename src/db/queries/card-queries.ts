import { db } from '@/lib/db';
import { cardsTable, decksTable, type Card, type NewCard } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Get all cards for a deck with ownership verification
export async function getDeckCards(deckId: string, userId: string) {
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

  return { deck, cards: deck.cards };
}

// Get single card with ownership verification through deck
export async function getUserCard(cardId: string, userId: string) {
  const card = await db.query.cardsTable.findFirst({
    where: eq(cardsTable.id, cardId),
    with: {
      deck: true,
    },
  });

  if (!card || card.deck.userId !== userId) {
    throw new Error('Card not found or access denied');
  }

  return card;
}

// Create a single card (with deck ownership verification)
export async function createCard(data: Omit<NewCard, 'createdAt' | 'updatedAt'> & { userId: string }) {
  // Verify deck ownership
  const deck = await db.query.decksTable.findFirst({
    where: and(
      eq(decksTable.id, data.deckId),
      eq(decksTable.userId, data.userId)
    ),
  });

  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  // Create the card
  const { userId, ...cardData } = data;
  const [newCard] = await db.insert(cardsTable)
    .values({
      ...cardData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newCard;
}

// Create multiple cards at once (with deck ownership verification)
export async function createCards(data: {
  deckId: string;
  userId: string;
  cards: Array<Pick<NewCard, 'front' | 'back'>>;
}) {
  // Verify deck ownership
  const deck = await db.query.decksTable.findFirst({
    where: and(
      eq(decksTable.id, data.deckId),
      eq(decksTable.userId, data.userId)
    ),
  });

  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  // Prepare card data with default spaced repetition values
  const cardsToInsert = data.cards.map(card => ({
    front: card.front,
    back: card.back,
    deckId: data.deckId,
    difficulty: 0,
    repetitions: 0,
    easeFactor: 250,
    interval: 1,
    nextReview: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Bulk insert
  const newCards = await db.insert(cardsTable)
    .values(cardsToInsert)
    .returning();

  return newCards;
}

// Update card with ownership verification
export async function updateCard(
  cardId: string,
  userId: string,
  updates: Partial<Pick<Card, 'front' | 'back' | 'difficulty' | 'repetitions' | 'easeFactor' | 'interval' | 'nextReview'>>
) {
  // Get the card and verify ownership through deck
  const existingCard = await db.query.cardsTable.findFirst({
    where: eq(cardsTable.id, cardId),
    with: {
      deck: true,
    },
  });

  if (!existingCard || existingCard.deck.userId !== userId) {
    throw new Error('Card not found or access denied');
  }

  // Update the card
  const [updatedCard] = await db.update(cardsTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cardId))
    .returning();

  return updatedCard;
}

// Delete card with ownership verification
export async function deleteCard(cardId: string, userId: string) {
  // Get the card and verify ownership through deck
  const existingCard = await db.query.cardsTable.findFirst({
    where: eq(cardsTable.id, cardId),
    with: {
      deck: true,
    },
  });

  if (!existingCard || existingCard.deck.userId !== userId) {
    throw new Error('Card not found or access denied');
  }

  // Delete the card
  const deletedCard = await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .returning();

  if (deletedCard.length === 0) {
    throw new Error('Failed to delete card');
  }

  return deletedCard[0];
}

// Get cards due for review for a specific deck
export async function getCardsForReview(deckId: string, userId: string, limit?: number) {
  // Verify deck ownership first
  const deck = await db.query.decksTable.findFirst({
    where: and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ),
  });

  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  // Get cards due for review
  const cards = await db.query.cardsTable.findMany({
    where: and(
      eq(cardsTable.deckId, deckId),
    ),
    orderBy: (cards, { asc }) => [asc(cards.nextReview)],
    limit: limit ?? 20,
  });

  return cards;
}

// TypeScript types for query parameters
export type CardQueryOptions = {
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'nextReview' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
};

export type CardUpdates = Partial<Pick<Card, 'front' | 'back' | 'difficulty' | 'repetitions' | 'easeFactor' | 'interval' | 'nextReview'>>;

export type BulkCreateCardsInput = {
  deckId: string;
  userId: string;
  cards: Array<Pick<NewCard, 'front' | 'back'>>;
};
