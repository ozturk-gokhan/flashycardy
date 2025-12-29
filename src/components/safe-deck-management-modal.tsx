'use client';

import { DeckManagementModal } from './deck-management-modal';
import type { Deck, Card as FlashCard } from '@/db/schema';

interface SafeDeckManagementModalProps {
  deck: Deck & { cards: FlashCard[] };
  children: React.ReactNode;
}

export function SafeDeckManagementModal({ deck, children }: SafeDeckManagementModalProps) {
  try {
    // Validate deck data structure
    if (!deck || typeof deck.id !== 'string' || !deck.title) {
      console.warn('Invalid deck data for modal:', deck);
      return <>{children}</>;
    }

    // Ensure cards array exists
    const normalizedDeck = {
      ...deck,
      cards: Array.isArray(deck.cards) ? deck.cards : [],
    };

    return (
      <DeckManagementModal deck={normalizedDeck}>
        {children}
      </DeckManagementModal>
    );
  } catch (error) {
    console.error('Error in SafeDeckManagementModal:', error, 'Deck:', deck);
    // Always render the children (button) even if modal fails
    return <>{children}</>;
  }
}
