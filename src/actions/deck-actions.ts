'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createDeck, updateDeck, deleteDeck } from '@/db/queries/deck-queries';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Zod validation schema
const CreateDeckSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  isPublic: z.boolean().default(false),
});

// TypeScript type from Zod schema
type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  // Authentication check
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    // Validate input data
    const validatedInput = CreateDeckSchema.parse(input);

    // Database mutation using query helper
    const newDeck = await createDeck({
      ...validatedInput,
      userId,
    });

    // Revalidate cache
    revalidatePath('/flashcards');
    
    return { success: true, deck: newDeck };
  } catch (error) {
    console.error('Failed to create deck:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed',
        details: error.issues 
      };
    }
    
    return { success: false, error: 'Failed to create deck' };
  }
}

// Update deck server action
const UpdateDeckSchema = z.object({
  id: z.string().uuid(),
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  isPublic: z.boolean().default(false),
});

type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

export async function updateDeckAction(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedInput = UpdateDeckSchema.parse(input);
    const { id, ...updates } = validatedInput;

    // Update using query helper with built-in ownership verification
    const updatedDeck = await updateDeck(id, userId, updates);

    revalidatePath('/flashcards');
    return { success: true, deck: updatedDeck };
  } catch (error) {
    console.error('Failed to update deck:', error);
    
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
    
    return { success: false, error: 'Failed to update deck' };
  }
}

// Delete deck server action
export async function deleteDeckAction(deckId: string) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedId = z.string().uuid().parse(deckId);

    // Delete using query helper with built-in ownership verification
    await deleteDeck(validatedId, userId);

    revalidatePath('/flashcards');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete deck:', error);
    
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
    
    return { success: false, error: 'Failed to delete deck' };
  }
}
