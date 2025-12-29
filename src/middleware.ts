import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/flashcards(.*)',
  '/study(.*)',
  '/settings(.*)',
  '/profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is protected and user is not authenticated
  if (isProtectedRoute(req) && !(await auth()).userId) {
    // Redirect to home page (landing page)
    return NextResponse.redirect(new URL('/', req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
