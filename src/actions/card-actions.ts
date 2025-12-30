'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createCard, createCards, updateCard, deleteCard, getDeckCards } from '@/db/queries/card-queries';
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

// Create a single card
export async function createCardAction(input: CreateCardInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedInput = CreateCardSchema.parse(input);

    // Create the card using query helper (includes ownership verification)
    const newCard = await createCard({
      front: validatedInput.front,
      back: validatedInput.back,
      deckId: validatedInput.deckId,
      difficulty: 0,
      repetitions: 0,
      easeFactor: 250,
      interval: 1,
      nextReview: new Date(),
      userId,
    });

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
    
    if (error instanceof Error && error.message.includes('not found')) {
      return { success: false, error: 'Deck not found or access denied' };
    }
    
    return { success: false, error: 'Failed to create card' };
  }
}

// Create multiple cards at once
export async function createCardsAction(input: BulkCreateCardsInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedInput = BulkCreateCardsSchema.parse(input);

    // Create cards using query helper (includes ownership verification)
    const newCards = await createCards({
      deckId: validatedInput.deckId,
      userId,
      cards: validatedInput.cards,
    });

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
    
    if (error instanceof Error && error.message.includes('not found')) {
      return { success: false, error: 'Deck not found or access denied' };
    }
    
    return { success: false, error: 'Failed to create cards' };
  }
}

// Update an existing card
export async function updateCardAction(input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedInput = UpdateCardSchema.parse(input);

    // Update the card using query helper (includes ownership verification)
    const updatedCard = await updateCard(validatedInput.id, userId, {
      front: validatedInput.front,
      back: validatedInput.back,
    });

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
    
    if (error instanceof Error && error.message.includes('not found')) {
      return { success: false, error: 'Card not found or access denied' };
    }
    
    return { success: false, error: 'Failed to update card' };
  }
}

// Delete a card
export async function deleteCardAction(cardId: string) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedId = z.string().uuid().parse(cardId);

    // Delete the card using query helper (includes ownership verification)
    await deleteCard(validatedId, userId);

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
    
    if (error instanceof Error && error.message.includes('not found')) {
      return { success: false, error: 'Card not found or access denied' };
    }
    
    return { success: false, error: 'Failed to delete card' };
  }
}

// Get cards for a specific deck (with ownership verification)
export async function getDeckCardsAction(deckId: string) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedDeckId = z.string().uuid().parse(deckId);

    // Get deck cards using query helper (includes ownership verification)
    const result = await getDeckCards(validatedDeckId, userId);

    return { success: true, deck: result.deck, cards: result.cards };
  } catch (error) {
    console.error('Failed to get deck cards:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid deck ID',
        details: error.issues 
      };
    }
    
    if (error instanceof Error && error.message.includes('not found')) {
      return { success: false, error: 'Deck not found or access denied' };
    }
    
    return { success: false, error: 'Failed to retrieve cards' };
  }
}
