'use client';

import { Button } from '@/components/ui/button';
import { DeckManagementModal } from '@/components/deck-management-modal';
import type { Deck, Card as FlashCard } from '@/db/schema';

interface EditDeckButtonProps {
  deck: Deck & { cards: FlashCard[] };
  className?: string;
}

export function EditDeckButton({ deck, className }: EditDeckButtonProps) {
  // Validate deck data - this should never fail with proper data from server
  if (!deck || !deck.id) {
    console.error('Invalid deck data in EditDeckButton:', deck);
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className={`text-slate-300 border-slate-600 hover:bg-slate-700 ${className || ''}`}
        onClick={() => {
          alert(`Deck management is temporarily unavailable. Please try refreshing the page.`);
        }}
      >
        Edit
      </Button>
    );
  }

  // Ensure cards is an array
  const normalizedDeck = {
    ...deck,
    cards: Array.isArray(deck.cards) ? deck.cards : [],
  };

  return (
    <DeckManagementModal deck={normalizedDeck}>
      <Button 
        size="sm" 
        variant="outline" 
        className={`text-slate-300 border-slate-600 hover:bg-slate-700 ${className || ''}`}
      >
        Edit
      </Button>
    </DeckManagementModal>
  );
}
