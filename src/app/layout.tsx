import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FlashyCardy",
  description: "Master any subject with intelligent flashcards and spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" className="dark">
        <body
          className={`${poppins.variable} antialiased`}
        >
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold">Flashy Cardy</h1>
              </div>
              <div className="flex items-center space-x-4">
                <SignedIn>
                  <nav className="flex items-center space-x-4 mr-4">
                    <a href="/dashboard" className="text-sm hover:text-blue-400 transition-colors">
                      Dashboard
                    </a>
                    <a href="/flashcards" className="text-sm hover:text-blue-400 transition-colors">
                      Flashcards
                    </a>
                    <a href="/study" className="text-sm hover:text-blue-400 transition-colors">
                      Study
                    </a>
                  </nav>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
