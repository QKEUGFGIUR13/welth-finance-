import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { ensureUser, AuthTokenBridge } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export default function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      ensureUser().catch((err) => console.error("ensureUser failed", err));
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/80"
          : "bg-background/40 backdrop-blur-sm border-b border-transparent"
      )}
    >
      <AuthTokenBridge />
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <SignedOut>
            <a
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
          </SignedOut>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SignedIn>
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2">
                <LayoutDashboard size={16} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link to="/transaction/create">
              <Button className="gap-2">
                <PenBox size={16} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Log in</Button>
            </SignInButton>
            <Link to="/sign-up">
              <Button>Get started</Button>
            </Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
