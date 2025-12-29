import { SignInButton, SignUpButton, SignedOut, SignedIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Logo size="hero" showText={true} href="/" />
          </div>
          <p className="text-lg md:text-xl text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        
        <SignedOut>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton mode="modal">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="default" size="lg">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
