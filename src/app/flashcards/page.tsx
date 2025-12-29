import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { decksTable, cardsTable, type Deck } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function Flashcards() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Fetch user's decks with card count
  const userDecks = await db.query.decksTable.findMany({
    where: eq(decksTable.userId, userId),
    with: {
      cards: true,
    },
    orderBy: (decks, { desc }) => [desc(decks.createdAt)],
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Flashcards
            </h1>
            <p className="text-lg text-slate-300">
              Create and manage your flashcard decks
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {userDecks.length === 0 ? 'No Decks Yet' : `${userDecks.length} Deck${userDecks.length === 1 ? '' : 's'}`}
                </h2>
                <p className="text-slate-300 mt-1">
                  {userDecks.length === 0 
                    ? 'Start your learning journey by creating your first deck'
                    : 'Manage your flashcard collections'
                  }
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                Create New Deck
              </Button>
            </div>

            {userDecks.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-white mb-3">No Decks Found</h3>
                  <p className="text-slate-300 mb-6">
                    Create your first flashcard deck to get started with your studies.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create Your First Deck
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userDecks.map((deck) => (
                  <Card key={deck.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700 transition-all cursor-pointer group">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                            {deck.title}
                          </CardTitle>
                          {deck.description && (
                            <CardDescription className="text-slate-300 mt-2 line-clamp-2">
                              {deck.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700 ml-2">
                          {deck.cards.length} cards
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-400">
                          Created: {new Date(deck.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
                            Edit
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Study
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
