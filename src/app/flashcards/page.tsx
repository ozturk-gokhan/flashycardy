import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Flashcards() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

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

          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-semibold text-white mb-4">No Flashcards Yet</h3>
              <p className="text-slate-300 mb-6">
                This is another protected route. Start creating your first flashcard deck!
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Create New Deck
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
