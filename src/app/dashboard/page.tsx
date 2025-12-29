import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Dashboard
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Manage your flashcard decks, track your progress, and accelerate your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
            <Link href="/flashcards">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 hover:bg-slate-700 transition-all cursor-pointer group">
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  Flashcard Decks
                </h3>
                <p className="text-slate-300">
                  Manage your study materials
                </p>
              </div>
            </Link>
            
            <Link href="/study">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 hover:bg-slate-700 transition-all cursor-pointer group">
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  Study Progress
                </h3>
                <p className="text-slate-300">
                  Track your learning journey
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
