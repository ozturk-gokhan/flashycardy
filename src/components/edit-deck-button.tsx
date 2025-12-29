'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DeckManagementModal } from '@/components/deck-management-modal';
import type { Deck, Card as FlashCard } from '@/db/schema';

interface EditDeckButtonProps {
  deck: Deck & { cards: FlashCard[] };
}

export function EditDeckButton({ deck }: EditDeckButtonProps) {
  const [hasModalError, setHasModalError] = useState(false);

  // Always render the Edit button
  const editButton = (
    <Button 
      size="sm" 
      variant="outline" 
      className="text-slate-300 border-slate-600 hover:bg-slate-700"
    >
      Edit
    </Button>
  );

  // If we have an error with the modal, render just the button with an alert
  if (hasModalError) {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="text-slate-300 border-slate-600 hover:bg-slate-700"
        onClick={() => {
          alert(`Deck management for "${deck.title}" is temporarily unavailable. Please try refreshing the page.`);
        }}
      >
        Edit
      </Button>
    );
  }

  try {
    // Validate deck data
    if (!deck || !deck.id || typeof deck.id !== 'string') {
      console.error('Invalid deck data in EditDeckButton:', deck);
      setHasModalError(true);
      return editButton;
    }

    // Ensure cards is an array
    const normalizedDeck = {
      ...deck,
      cards: Array.isArray(deck.cards) ? deck.cards : [],
    };

    return (
      <DeckManagementModal deck={normalizedDeck}>
        {editButton}
      </DeckManagementModal>
    );
  } catch (error) {
    console.error('Error in EditDeckButton:', error, 'Deck:', deck);
    setHasModalError(true);
    return editButton;
  }
}
