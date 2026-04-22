/**
 * Navbar — Top navigation for SpotRole AI single-page app
 * Design: Warm Modernism — Sora font, warm cream bg, indigo accents
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, Menu, X, Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface NavbarProps {
  onOpenPricing?: () => void;
  onScrollToUpload?: () => void;
}

export default function Navbar({ onOpenPricing, onScrollToUpload }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2.5 group cursor-default">
          <div className="w-9 h-9 rounded-xl bg-[oklch(0.488_0.243_264.376)] flex items-center justify-center shadow-md shadow-[oklch(0.488_0.243_264.376/0.25)] group-hover:shadow-lg group-hover:shadow-[oklch(0.488_0.243_264.376/0.35)] transition-shadow duration-300">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            Spot<span className="text-[oklch(0.488_0.243_264.376)]">Role</span> AI
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={onScrollToUpload}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Match My CV
          </button>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#stats"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Results
          </a>
        </div>

        {/* Right side: Dark mode + CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <Button
            onClick={() => onOpenPricing?.()}
            className="hidden sm:flex items-center gap-2 bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.441_0.243_264.376)] text-white rounded-xl font-display font-semibold text-sm shadow-md shadow-[oklch(0.488_0.243_264.376/0.25)] hover:shadow-lg hover:shadow-[oklch(0.488_0.243_264.376/0.35)] transition-all duration-300"
          >
            <Zap className="w-4 h-4" />
            Get Full Access
          </Button>

          <button
            className="md:hidden p-2 rounded-xl hover:bg-accent transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container py-4 space-y-1">
            <button
              onClick={() => { onScrollToUpload?.(); setMobileOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Match My CV
            </button>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              How It Works
            </a>
            <a
              href="#stats"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Results
            </a>
            <Button
              onClick={() => { onOpenPricing?.(); setMobileOpen(false); }}
              className="w-full mt-3 bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.441_0.243_264.376)] text-white rounded-xl font-display font-semibold text-sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Get Full Access
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
