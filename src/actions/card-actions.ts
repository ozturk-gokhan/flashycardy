'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { cardsTable, decksTable, type NewCard, type Card } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Zod validation schemas
const CreateCardSchema = z.object({
  front: z.string()
    .min(1, 'Front content is required')
    .max(2000, 'Front content must be less than 2000 characters')
    .trim(),
  back: z.string()
    .min(1, 'Back content is required')
    .max(2000, 'Back content must be less than 2000 characters')
    .trim(),
  deckId: z.string().uuid('Invalid deck ID'),
});

const UpdateCardSchema = z.object({
  id: z.string().uuid('Invalid card ID'),
  front: z.string()
    .min(1, 'Front content is required')
    .max(2000, 'Front content must be less than 2000 characters')
    .trim(),
  back: z.string()
    .min(1, 'Back content is required')
    .max(2000, 'Back content must be less than 2000 characters')
    .trim(),
});

const BulkCreateCardsSchema = z.object({
  deckId: z.string().uuid('Invalid deck ID'),
  cards: z.array(z.object({
    front: z.string().min(1, 'Front content is required').max(2000).trim(),
    back: z.string().min(1, 'Back content is required').max(2000).trim(),
  })).min(1, 'At least one card is required').max(50, 'Maximum 50 cards at once'),
});

// TypeScript types from Zod schemas
type CreateCardInput = z.infer<typeof CreateCardSchema>;
type UpdateCardInput = z.infer<typeof UpdateCardSchema>;
type BulkCreateCardsInput = z.infer<typeof BulkCreateCardsSchema>;

// Helper function to verify deck ownership
async function verifyDeckOwnership(deckId: string, userId: string) {
  const deck = await db.query.decksTable.findFirst({
    where: and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ),
  });
  return deck !== undefined;
}

// Create a single card
export async function createCard(input: CreateCardInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedInput = CreateCardSchema.parse(input);

    // Verify deck ownership
    const deckExists = await verifyDeckOwnership(validatedInput.deckId, userId);
    if (!deckExists) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // Create the card
    const [newCard] = await db.insert(cardsTable)
      .values({
        front: validatedInput.front,
        back: validatedInput.back,
        deckId: validatedInput.deckId,
        difficulty: 0,
        repetitions: 0,
        easeFactor: 250,
        interval: 1,
        nextReview: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath('/flashcards');
    return { success: true, card: newCard };
  } catch (error) {
    console.error('Failed to create card:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed',
        details: error.issues 
      };
    }
    
    return { success: false, error: 'Failed to create card' };
  }
}

// Create multiple cards at once
export async function createCards(input: BulkCreateCardsInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedInput = BulkCreateCardsSchema.parse(input);

    // Verify deck ownership
    const deckExists = await verifyDeckOwnership(validatedInput.deckId, userId);
    if (!deckExists) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // Prepare card data
    const cardsToInsert = validatedInput.cards.map(card => ({
      front: card.front,
      back: card.back,
      deckId: validatedInput.deckId,
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

    revalidatePath('/flashcards');
    return { success: true, cards: newCards };
  } catch (error) {
    console.error('Failed to create cards:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed',
        details: error.issues 
      };
    }
    
    return { success: false, error: 'Failed to create cards' };
  }
}

// Update an existing card
export async function updateCard(input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedInput = UpdateCardSchema.parse(input);

    // Get the card and verify ownership through deck
    const existingCard = await db.query.cardsTable.findFirst({
      where: eq(cardsTable.id, validatedInput.id),
      with: {
        deck: true,
      },
    });

    if (!existingCard || existingCard.deck.userId !== userId) {
      return { success: false, error: 'Card not found or access denied' };
    }

    // Update the card
    const [updatedCard] = await db.update(cardsTable)
      .set({
        front: validatedInput.front,
        back: validatedInput.back,
        updatedAt: new Date(),
      })
      .where(eq(cardsTable.id, validatedInput.id))
      .returning();

    revalidatePath('/flashcards');
    return { success: true, card: updatedCard };
  } catch (error) {
    console.error('Failed to update card:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed',
        details: error.issues 
      };
    }
    
    return { success: false, error: 'Failed to update card' };
  }
}

// Delete a card
export async function deleteCard(cardId: string) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedId = z.string().uuid().parse(cardId);

    // Get the card and verify ownership through deck
    const existingCard = await db.query.cardsTable.findFirst({
      where: eq(cardsTable.id, validatedId),
      with: {
        deck: true,
      },
    });

    if (!existingCard || existingCard.deck.userId !== userId) {
      return { success: false, error: 'Card not found or access denied' };
    }

    // Delete the card
    const deletedCard = await db.delete(cardsTable)
      .where(eq(cardsTable.id, validatedId))
      .returning();

    if (deletedCard.length === 0) {
      return { success: false, error: 'Failed to delete card' };
    }

    revalidatePath('/flashcards');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete card:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid card ID',
        details: error.issues 
      };
    }
    
    return { success: false, error: 'Failed to delete card' };
  }
}

// Get cards for a specific deck (with ownership verification)
export async function getDeckCards(deckId: string) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedDeckId = z.string().uuid().parse(deckId);

    // Verify deck ownership and get cards
    const deck = await db.query.decksTable.findFirst({
      where: and(
        eq(decksTable.id, validatedDeckId),
        eq(decksTable.userId, userId)
      ),
      with: {
        cards: {
          orderBy: (cards, { desc }) => [desc(cards.createdAt)],
        },
      },
    });

    if (!deck) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    return { success: true, deck, cards: deck.cards };
  } catch (error) {
    console.error('Failed to get deck cards:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid deck ID',
        details: error.issues 
      };
    }
    
    return { success: false, error: 'Failed to retrieve cards' };
  }
}
