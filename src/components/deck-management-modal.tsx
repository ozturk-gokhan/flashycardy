'use client';

import { useState, useEffect } from 'react';
import { getDeckCardsAction, createCardAction, createCardsAction, updateCardAction, deleteCardAction } from '@/actions/card-actions';
import { updateDeckAction, deleteDeckAction } from '@/actions/deck-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit3, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Upload, 
  Settings,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import type { Deck, Card as FlashCard } from '@/db/schema';

interface DeckManagementModalProps {
  deck: Deck & { cards: FlashCard[] };
  children: React.ReactNode;
}

interface EditingCard {
  id: string;
  front: string;
  back: string;
}

interface NewCard {
  front: string;
  back: string;
}

export function DeckManagementModal({ deck: initialDeck, children }: DeckManagementModalProps) {
  // Defensive check for deck data
  if (!initialDeck || !initialDeck.id) {
    console.error('DeckManagementModal: Invalid deck data', initialDeck);
    return <>{children}</>;
  }

  const [open, setOpen] = useState(false);
  const [deck, setDeck] = useState(initialDeck);
  const [cards, setCards] = useState<FlashCard[]>(initialDeck.cards || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Deck editing state
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [deckForm, setDeckForm] = useState({
    title: deck.title,
    description: deck.description || '',
    isPublic: deck.isPublic,
  });
  
  // Card editing state
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [newCard, setNewCard] = useState<NewCard>({ front: '', back: '' });
  const [bulkCards, setBulkCards] = useState('');
  
  // Load fresh data when modal opens
  useEffect(() => {
    if (open) {
      loadDeckData();
    }
  }, [open]);

  const loadDeckData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getDeckCardsAction(deck.id);
      if (result.success) {
        setCards(result.cards || []);
        if (result.deck) {
          setDeck(result.deck);
        }
      } else {
        setError(result.error || 'Failed to load deck data');
      }
    } catch (err) {
      setError('Failed to load deck data');
      console.error('Load deck error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      setError('Both front and back content are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createCardAction({
        front: newCard.front,
        back: newCard.back,
        deckId: deck.id,
      });

      if (result.success) {
        setCards(prev => [result.card!, ...prev]);
        setNewCard({ front: '', back: '' });
      } else {
        setError(result.error || 'Failed to create card');
      }
    } catch (err) {
      setError('Failed to create card');
      console.error('Create card error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (!bulkCards.trim()) {
      setError('Please enter cards to import');
      return;
    }

    // Parse bulk format: front|back per line
    const lines = bulkCards.trim().split('\n').filter(line => line.trim());
    const parsedCards: { front: string; back: string }[] = [];

    for (const line of lines) {
      const parts = line.split('|').map(part => part.trim());
      if (parts.length === 2 && parts[0] && parts[1]) {
        parsedCards.push({ front: parts[0], back: parts[1] });
      }
    }

    if (parsedCards.length === 0) {
      setError('No valid cards found. Use format: "Front text|Back text" per line');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createCardsAction({
        deckId: deck.id,
        cards: parsedCards,
      });

      if (result.success) {
        setCards(prev => [...result.cards!, ...prev]);
        setBulkCards('');
      } else {
        setError(result.error || 'Failed to create cards');
      }
    } catch (err) {
      setError('Failed to create cards');
      console.error('Bulk create error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCard = async (cardId: string) => {
    if (!editingCard) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateCardAction({
        id: cardId,
        front: editingCard.front,
        back: editingCard.back,
      });

      if (result.success) {
        setCards(prev => prev.map(card => 
          card.id === cardId ? result.card! : card
        ));
        setEditingCard(null);
      } else {
        setError(result.error || 'Failed to update card');
      }
    } catch (err) {
      setError('Failed to update card');
      console.error('Update card error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteCardAction(cardId);

      if (result.success) {
        setCards(prev => prev.filter(card => card.id !== cardId));
      } else {
        setError(result.error || 'Failed to delete card');
      }
    } catch (err) {
      setError('Failed to delete card');
      console.error('Delete card error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDeck = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateDeckAction({
        id: deck.id,
        title: deckForm.title,
        description: deckForm.description,
        isPublic: deckForm.isPublic,
      });

      if (result.success) {
        setDeck(prev => ({ ...prev, ...result.deck! }));
        setIsEditingDeck(false);
      } else {
        setError(result.error || 'Failed to update deck');
      }
    } catch (err) {
      setError('Failed to update deck');
      console.error('Update deck error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!confirm(`Are you sure you want to delete "${deck.title}" and all its cards? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteDeckAction(deck.id);

      if (result.success) {
        setOpen(false);
        // Page will refresh automatically due to revalidatePath
      } else {
        setError(result.error || 'Failed to delete deck');
      }
    } catch (err) {
      setError('Failed to delete deck');
      console.error('Delete deck error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700 overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Manage Deck: {deck.title}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Add, edit, and organize cards in your deck
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-md p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Tabs defaultValue="cards" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="cards" className="data-[state=active]:bg-slate-600">
              Cards ({cards.length})
            </TabsTrigger>
            <TabsTrigger value="add" className="data-[state=active]:bg-slate-600">
              Add Cards
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-600">
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="cards" className="h-full overflow-y-auto space-y-3 mt-4">
              {isLoading && cards.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-400">Loading cards...</span>
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No cards in this deck yet.</p>
                  <p className="text-slate-500 text-sm mt-1">Use the "Add Cards" tab to get started.</p>
                </div>
              ) : (
                cards.map((card) => (
                  <Card key={card.id} className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      {editingCard?.id === card.id ? (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-white text-sm">Front</Label>
                            <Textarea
                              value={editingCard.front}
                              onChange={(e) => setEditingCard(prev => prev ? { ...prev, front: e.target.value } : null)}
                              className="bg-slate-600 border-slate-500 text-white mt-1"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label className="text-white text-sm">Back</Label>
                            <Textarea
                              value={editingCard.back}
                              onChange={(e) => setEditingCard(prev => prev ? { ...prev, back: e.target.value } : null)}
                              className="bg-slate-600 border-slate-500 text-white mt-1"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateCard(card.id)}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCard(null)}
                              disabled={isLoading}
                              className="border-slate-500 text-slate-300"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <Label className="text-slate-300 text-xs uppercase">Front</Label>
                              <p className="text-white mt-1">{card.front}</p>
                            </div>
                            <div>
                              <Label className="text-slate-300 text-xs uppercase">Back</Label>
                              <p className="text-white mt-1">{card.back}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                              Difficulty: {card.difficulty}
                            </Badge>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingCard({
                                  id: card.id,
                                  front: card.front,
                                  back: card.back,
                                })}
                                disabled={isLoading}
                                className="border-slate-500 text-slate-300 hover:bg-slate-600"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCard(card.id)}
                                disabled={isLoading}
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="add" className="space-y-6 mt-4">
              {/* Single Card Form */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Single Card
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="front" className="text-white">Front</Label>
                    <Textarea
                      id="front"
                      placeholder="Enter front content..."
                      value={newCard.front}
                      onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                      className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="back" className="text-white">Back</Label>
                    <Textarea
                      id="back"
                      placeholder="Enter back content..."
                      value={newCard.back}
                      onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                      className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleCreateCard}
                    disabled={isLoading || !newCard.front.trim() || !newCard.back.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Add Card
                  </Button>
                </CardContent>
              </Card>

              {/* Bulk Import */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Bulk Import
                  </CardTitle>
                  <p className="text-slate-300 text-sm">
                    Import multiple cards using format: <code className="bg-slate-600 px-1 rounded">Front text|Back text</code> (one per line)
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What is React?|A JavaScript library for building user interfaces&#10;What is TypeScript?|A typed superset of JavaScript"
                    value={bulkCards}
                    onChange={(e) => setBulkCards(e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                    rows={8}
                  />
                  <Button
                    onClick={handleBulkCreate}
                    disabled={isLoading || !bulkCards.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Import Cards
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Deck Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingDeck ? (
                    <>
                      <div>
                        <Label htmlFor="deck-title" className="text-white">Title</Label>
                        <Input
                          id="deck-title"
                          value={deckForm.title}
                          onChange={(e) => setDeckForm(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deck-description" className="text-white">Description</Label>
                        <Textarea
                          id="deck-description"
                          value={deckForm.description}
                          onChange={(e) => setDeckForm(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-slate-600 border-slate-500 text-white"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="deck-public"
                          type="checkbox"
                          checked={deckForm.isPublic}
                          onChange={(e) => setDeckForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600"
                        />
                        <Label htmlFor="deck-public" className="text-white">Make this deck public</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdateDeck}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingDeck(false)}
                          disabled={isLoading}
                          className="border-slate-500 text-slate-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-slate-300">Title</Label>
                          <p className="text-white">{deck.title}</p>
                        </div>
                        {deck.description && (
                          <div>
                            <Label className="text-slate-300">Description</Label>
                            <p className="text-white">{deck.description}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-slate-300">Visibility</Label>
                          <p className="text-white">{deck.isPublic ? 'Public' : 'Private'}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsEditingDeck(true)}
                        variant="outline"
                        className="border-slate-500 text-slate-300"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Deck Details
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-red-950/50 border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-300 text-sm mb-4">
                    Permanently delete this deck and all its cards. This action cannot be undone.
                  </p>
                  <Button
                    onClick={handleDeleteDeck}
                    disabled={isLoading}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Delete Deck
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
