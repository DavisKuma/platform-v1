/**
 * HiringManagerModal — Shows AI-identified hiring managers for a job
 * Fetches real data from POST /api/hiring-managers
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  User, Building2, Shield, ExternalLink, Loader2,
  AlertCircle, BadgeCheck, Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import type { HiringManagerResult } from "@/lib/api";

interface HiringManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: string;
  jobTitle: string;
}

function getScoreBadge(score: number) {
  if (score >= 85) return { label: "Very Likely", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" };
  if (score >= 70) return { label: "Likely", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" };
  if (score >= 50) return { label: "Possible", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" };
  return { label: "Low", bg: "bg-gray-100 dark:bg-gray-800/30", text: "text-gray-600 dark:text-gray-400" };
}

export default function HiringManagerModal({ isOpen, onClose, company, jobTitle }: HiringManagerModalProps) {
  const [people, setPeople] = useState<HiringManagerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !company || !jobTitle) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPeople([]);

    api.findHiringManagers(company, jobTitle)
      .then((res) => {
        if (!cancelled) setPeople(res.people);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to find hiring managers");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, company, jobTitle]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border rounded-2xl p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-[oklch(0.488_0.243_264.376/0.1)] flex items-center justify-center">
                <Search className="w-5 h-5 text-[oklch(0.488_0.243_264.376)]" />
              </div>
              <div>
                <DialogTitle className="font-display font-bold text-lg text-foreground">
                  Hiring Decision-Makers
                </DialogTitle>
                <p className="text-sm text-muted-foreground">{company}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Company + Role Info */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Company</p>
                <p className="text-sm font-semibold text-foreground truncate">{company}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <Shield className="w-4 h-4 text-[oklch(0.596_0.145_163.225)] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Role</p>
                <p className="text-sm font-semibold text-foreground truncate">{jobTitle}</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 text-[oklch(0.488_0.243_264.376)] animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Searching for hiring managers...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Try again or check a different company.</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && people.length === 0 && (
            <div className="text-center py-10">
              <User className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No hiring managers found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different company or role</p>
            </div>
          )}

          {/* Results */}
          {!loading && people.length > 0 && (
            <div className="space-y-3">
              {people.map((person, i) => {
                const badge = getScoreBadge(person.ai_score);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className="rounded-xl border border-border p-4 hover:border-[oklch(0.488_0.243_264.376/0.3)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[oklch(0.488_0.243_264.376/0.08)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-5 h-5 text-[oklch(0.488_0.243_264.376)]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-display font-bold text-sm text-foreground truncate">
                              {person.full_name}
                            </p>
                            {person.is_verified && (
                              <BadgeCheck className="w-4 h-4 text-[oklch(0.488_0.243_264.376)] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{person.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                          {person.ai_score}% {badge.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {person.reason}
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs h-7 px-3"
                        onClick={() => window.open(person.linkedin_url, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Find on LinkedIn
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
              <p className="text-[10px] text-muted-foreground text-center pt-2">
                AI-estimated decision-makers. Click "Find on LinkedIn" to verify profiles.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
