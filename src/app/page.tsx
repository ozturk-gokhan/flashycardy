import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Flashy Cardy
            </span>
          </h1>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Master any subject with our interactive flashcard learning system.
            </p>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Create, study, and track your progress all in one place.
            </p>
          </div>
        </div>

        {/* Get Started Card */}
        <div className="mt-20 max-w-2xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-semibold text-white">
                Get Started Today
              </CardTitle>
              <CardDescription className="text-lg text-slate-300 leading-relaxed">
                Sign up or sign in to start creating your personalized flashcard decks.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-400 flex items-center justify-center gap-2">
                Click the buttons in the header above to get started! 
                <span className="text-xl">👆</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
