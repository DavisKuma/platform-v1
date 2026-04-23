/**
 * PricingModal — Get Full Access for SpotRole AI
 * Two options: Book a call with Davis or subscribe for daily email job updates
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Mail, Check, Zap, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleBookCall = () => {
    window.open("https://calendly.com/davis-kuma1/quick", "_blank");
  };

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubscribing(true);
    // Simulate subscription — replace with real API call when ready
    await new Promise((res) => setTimeout(res, 1200));
    setSubscribing(false);
    setSubscribed(true);
    toast.success("You're subscribed! Daily job matches will land in your inbox.");
  };

  const callBenefits = [
    "Personalised walkthrough of your CV matches",
    "Tailored job search strategy from Davis",
    "Discuss your target roles and companies",
    "30-minute focused career session",
  ];

  const emailBenefits = [
    "Top 5 job matches delivered every morning",
    "AI-ranked by relevance to your CV",
    "Live roles from Adzuna & Reed",
    "Unsubscribe anytime — no spam",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border rounded-2xl p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-[oklch(0.488_0.243_264.376)] flex items-center justify-center shadow-md shadow-[oklch(0.488_0.243_264.376/0.3)]">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="font-display font-bold text-xl text-foreground">
                  Get Full Access
                </DialogTitle>
                <p className="text-sm text-muted-foreground">Choose how you want to level up your job search</p>
              </div>
            </div>
          </DialogHeader>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* ── Option 1: Book a Call ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative rounded-2xl border-2 border-[oklch(0.488_0.243_264.376)] bg-[oklch(0.488_0.243_264.376/0.04)] p-6 flex flex-col"
            >
              <div className="absolute -top-3 left-5">
                <span className="px-3 py-1 bg-[oklch(0.488_0.243_264.376)] text-white text-xs font-bold rounded-full shadow">
                  Recommended
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.488_0.243_264.376/0.12)] flex items-center justify-center mb-4 mt-2">
                <Calendar className="w-5 h-5 text-[oklch(0.488_0.243_264.376)]" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">Book a Call with Me</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Get a personalised 30-minute session with Davis to supercharge your job search strategy.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {callBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-[oklch(0.488_0.243_264.376)] flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleBookCall}
                className="w-full bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.441_0.243_264.376)] text-white rounded-xl font-display font-bold text-sm py-5 shadow-lg shadow-[oklch(0.488_0.243_264.376/0.25)] transition-all duration-300"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book a Free Call
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">Free · 30 minutes · via Calendly</p>
            </motion.div>

            {/* ── Option 2: Daily Email Updates ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col"
            >
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.696_0.17_162.48/0.12)] flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-[oklch(0.596_0.145_163.225)]" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">Daily Job Updates</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Subscribe and receive your top AI-matched job opportunities every morning, tailored to your CV.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {emailBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-[oklch(0.596_0.145_163.225)] flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              {subscribed ? (
                <div className="w-full rounded-xl bg-[oklch(0.696_0.17_162.48/0.1)] border border-[oklch(0.696_0.17_162.48/0.3)] p-4 text-center">
                  <Sparkles className="w-5 h-5 text-[oklch(0.596_0.145_163.225)] mx-auto mb-1" />
                  <p className="text-sm font-semibold text-[oklch(0.596_0.145_163.225)]">You're subscribed!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Check your inbox tomorrow morning.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[oklch(0.696_0.17_162.48/0.4)] transition"
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  />
                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full bg-[oklch(0.596_0.145_163.225)] hover:bg-[oklch(0.546_0.145_163.225)] text-white rounded-xl font-display font-bold text-sm py-5 transition-all duration-300"
                  >
                    {subscribing ? (
                      <><span className="animate-spin mr-2">⟳</span> Subscribing...</>
                    ) : (
                      <><Mail className="w-4 h-4 mr-2" /> Subscribe for Free</>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Free · No spam · Unsubscribe anytime</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
