import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Study() {
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
              Study Session
            </h1>
            <p className="text-lg text-slate-300">
              Practice with your flashcards using spaced repetition
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-semibold text-white mb-4">Ready to Study?</h3>
              <p className="text-slate-300 mb-6">
                This protected study page will help you master your flashcards efficiently.
              </p>
              <div className="space-y-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors block mx-auto">
                  Start Study Session
                </button>
                <p className="text-slate-400 text-sm">
                  Try navigating to this URL without being signed in - you'll be redirected to the landing page!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
