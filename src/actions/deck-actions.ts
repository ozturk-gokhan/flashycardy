'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { decksTable, type NewDeck } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

export async function createDeck(input: CreateDeckInput) {
  // Authentication check
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    // Validate input data
    const validatedInput = CreateDeckSchema.parse(input);

    // Database mutation
    const [newDeck] = await db.insert(decksTable)
      .values({
        ...validatedInput,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

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

export async function updateDeck(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedInput = UpdateDeckSchema.parse(input);

    // Verify ownership and update
    const [updatedDeck] = await db.update(decksTable)
      .set({
        title: validatedInput.title,
        description: validatedInput.description,
        isPublic: validatedInput.isPublic,
        updatedAt: new Date(),
      })
      .where(and(
        eq(decksTable.id, validatedInput.id),
        eq(decksTable.userId, userId)
      ))
      .returning();

    if (!updatedDeck) {
      return { success: false, error: 'Deck not found or access denied' };
    }

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
    
    return { success: false, error: 'Failed to update deck' };
  }
}

// Delete deck server action
export async function deleteDeck(deckId: string) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  try {
    const validatedId = z.string().uuid().parse(deckId);

    const deletedDeck = await db.delete(decksTable)
      .where(and(
        eq(decksTable.id, validatedId),
        eq(decksTable.userId, userId)
      ))
      .returning();

    if (deletedDeck.length === 0) {
      return { success: false, error: 'Deck not found or access denied' };
    }

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
    
    return { success: false, error: 'Failed to delete deck' };
  }
}
