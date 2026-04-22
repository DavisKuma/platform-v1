/**
 * Footer — SpotRole AI footer
 * Design: Warm Modernism — warm card, indigo accents
 */
import { Target } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[oklch(0.488_0.243_264.376)] flex items-center justify-center">
                <Target className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-base text-foreground">
                Spot<span className="text-[oklch(0.488_0.243_264.376)]">Role</span> AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Upload your CV and let AI match you with the best job opportunities. Powered by live job data from Adzuna and Reed.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-muted-foreground">CV Matching</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Job Analysis</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Role Recommendations</span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {["CV Writing Tips", "Interview Prep", "Career Guides", "Blog"].map((link) => (
                <li key={link}>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SpotRole AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Contact"].map((link) => (
              <button key={link} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
