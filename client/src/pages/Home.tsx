/**
 * Home — SpotRole AI single-page CV matching platform
 * Features: Hero, CV Upload, AI Analysis, Job Matching Results, How It Works, Stats, Footer
 */
import { useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import PricingModal from "@/components/PricingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload, FileText, CheckCircle2, Sparkles, ArrowRight,
  ExternalLink, MapPin, Building2, Loader2, AlertCircle,
  ChevronDown, ChevronUp, Brain, Target, Zap, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobMatch {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  fitScore: number;
  fitReason: string;
  jobLink: string;
  jobDescription: string;
  source: string;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
type AnalysisStep = "idle" | "uploading" | "analysing" | "matching" | "done" | "error";

const STEP_LABELS: Record<AnalysisStep, string> = {
  idle: "Ready to upload",
  uploading: "Uploading your CV...",
  analysing: "AI is analysing your CV & scraping live jobs...",
  matching: "Matching you with the best roles...",
  done: "Analysis complete!",
  error: "Something went wrong",
};

const STEP_PROGRESS: Record<AnalysisStep, number> = {
  idle: 0,
  uploading: 15,
  analysing: 45,
  matching: 75,
  done: 100,
  error: 0,
};

// ─── Score Helpers ────────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 80) return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-200 dark:ring-emerald-800" };
  if (score >= 60) return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", ring: "ring-blue-200 dark:ring-blue-800" };
  if (score >= 40) return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-200 dark:ring-amber-800" };
  return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", ring: "ring-red-200 dark:ring-red-800" };
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Partial Match";
  return "Low Match";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState<AnalysisStep>("idle");
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ─── File Handler ─────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum 10MB.");
      return;
    }
    setFileName(file.name);
    setStep("uploading");
    setErrorMsg(null);
    setMatches([]);
    try {
      const stepTimer1 = setTimeout(() => setStep("analysing"), 1500);
      const stepTimer2 = setTimeout(() => setStep("matching"), 8000);
      const result = await api.matchJobs(file);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const mapped: JobMatch[] = (result.recommendations || []).map((rec: Record<string, any>, i: number) => ({
        id: String(i),
        jobTitle: rec["Job Title"] || "",
        company: rec["Company"] || "",
        location: rec["Location"] || "",
        salary: rec["Salary"] || "",
        fitScore: rec["Relevance Score"] || 0,
        fitReason: rec["Why"] || "",
        jobLink: rec["URL"] || "",
        jobDescription: rec["Description"] || "",
        source: rec["Source"] || "",
      }));
      setMatches(mapped);
      setTotalJobs(result.total_matched_jobs || 0);
      setStep("done");
      toast.success(
        `Found ${mapped.length} matching roles from ${result.sources?.adzuna ?? 0} Adzuna + ${result.sources?.reed ?? 0} Reed jobs!`
      );
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (error: any) {
      setStep("error");
      setErrorMsg(error.message || "Analysis failed. Please try again.");
      toast.error(error.message || "Analysis failed");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const displayedMatches = showAllMatches ? matches : matches.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onOpenPricing={() => setPricingModalOpen(true)}
        onScrollToUpload={scrollToUpload}
      />

      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(oklch(0.488 0.243 264.376) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }} />
        <div className="container relative py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              {/* Trust badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.488_0.243_264.376/0.1)] border border-[oklch(0.488_0.243_264.376/0.2)]"
              >
                <Target className="w-4 h-4 text-[oklch(0.488_0.243_264.376)]" />
                <span className="text-sm font-medium text-[oklch(0.488_0.243_264.376)]">
                  AI-Powered CV Matching
                </span>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground">
                  Find Your{" "}
                  <span className="text-[oklch(0.488_0.243_264.376)] relative">
                    Perfect Role
                    <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" preserveAspectRatio="none">
                      <path d="M0 5 Q50 1 100 4 Q150 7 200 3" stroke="oklch(0.488 0.243 264.376)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>
                    </svg>
                  </span>
                  {" "}with AI
                </h1>
              </motion.div>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl"
              >
                Upload your CV &rarr; AI analyses your skills &rarr; Live jobs scraped from Adzuna &amp; Reed &rarr; Ranked matches delivered instantly.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex flex-wrap gap-3"
              >
                <Button
                  onClick={scrollToUpload}
                  className="bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.441_0.243_264.376)] text-white rounded-xl font-display font-semibold shadow-lg shadow-[oklch(0.488_0.243_264.376/0.25)] hover:shadow-xl hover:shadow-[oklch(0.488_0.243_264.376/0.35)] transition-all duration-300 px-6 py-5 text-base"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload My CV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-xl font-display font-semibold px-6 py-5 text-base border-border hover:bg-accent"
                >
                  How It Works
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-4 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[oklch(0.696_0.17_162.48)]" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[oklch(0.696_0.17_162.48)]" />
                  <span>No sign-up required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[oklch(0.696_0.17_162.48)]" />
                  <span>Instant results</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Illustration / Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl bg-gradient-to-br from-[oklch(0.488_0.243_264.376/0.08)] to-[oklch(0.696_0.17_162.48/0.05)] border border-[oklch(0.488_0.243_264.376/0.15)] p-8 space-y-4">
                {/* Mock match cards */}
                {[
                  { role: "Senior Software Engineer", company: "TechCorp Ltd", score: 94, color: "emerald" },
                  { role: "Full Stack Developer", company: "StartupXYZ", score: 87, color: "blue" },
                  { role: "Backend Engineer", company: "FinTech Inc", score: 76, color: "blue" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                    className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <p className="font-display font-semibold text-sm text-foreground">{item.role}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.company}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      item.color === "emerald"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {item.score}% match
                    </div>
                  </motion.div>
                ))}
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1 text-[oklch(0.488_0.243_264.376)]" />
                    AI-ranked by relevance to your CV
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CV Upload Section ─────────────────────────────────────────────── */}
      <section ref={uploadSectionRef} className="py-16 md:py-20 bg-card/30">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
                Match Your CV Now
              </h2>
              <p className="text-muted-foreground text-lg">
                Upload your CV and get personalised job matches in minutes.
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === "idle" || step === "error" ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                      isDragging
                        ? "border-[oklch(0.488_0.243_264.376)] bg-[oklch(0.488_0.243_264.376/0.05)] scale-[1.02]"
                        : "border-border hover:border-[oklch(0.488_0.243_264.376/0.4)] hover:bg-[oklch(0.488_0.243_264.376/0.02)]"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="space-y-5">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-[oklch(0.488_0.243_264.376/0.08)] flex items-center justify-center">
                        <Upload className="w-8 h-8 text-[oklch(0.488_0.243_264.376)]" />
                      </div>
                      <div>
                        <p className="text-lg font-display font-semibold text-foreground mb-1">
                          Drop your CV here or click to upload
                        </p>
                        <p className="text-sm text-muted-foreground">PDF or DOCX — max 10MB</p>
                      </div>
                      <Button
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.441_0.243_264.376)] text-white rounded-xl font-display font-semibold shadow-lg shadow-[oklch(0.488_0.243_264.376/0.25)] hover:shadow-xl hover:shadow-[oklch(0.488_0.243_264.376/0.35)] transition-all duration-300 px-8 py-5 text-base"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload CV
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileInput}
                      />
                    </div>
                    {step === "error" && errorMsg && (
                      <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-destructive">{errorMsg}</p>
                          <p className="text-xs text-muted-foreground mt-1">Try uploading a different file or check the format.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : step !== "done" ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="border-2 border-[oklch(0.488_0.243_264.376/0.3)] rounded-2xl p-10 bg-[oklch(0.488_0.243_264.376/0.02)]">
                    <div className="text-center space-y-5">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-[oklch(0.488_0.243_264.376/0.08)] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[oklch(0.488_0.243_264.376)] animate-spin" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-foreground mb-1">
                          {STEP_LABELS[step]}
                        </h3>
                        {fileName && (
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            {fileName}
                          </p>
                        )}
                      </div>
                      <div className="max-w-sm mx-auto space-y-2">
                        <Progress value={STEP_PROGRESS[step]} className="h-2 rounded-full" />
                        <p className="text-xs text-muted-foreground text-right">
                          {STEP_PROGRESS[step]}%
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-6 pt-2">
                        {(["uploading", "analysing", "matching"] as AnalysisStep[]).map((s) => (
                          <div key={s} className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                              STEP_PROGRESS[step] >= STEP_PROGRESS[s]
                                ? "bg-[oklch(0.488_0.243_264.376)] text-white shadow-md shadow-[oklch(0.488_0.243_264.376/0.3)]"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {s === "uploading" && <Upload className="w-4 h-4" />}
                              {s === "analysing" && <Brain className="w-4 h-4" />}
                              {s === "matching" && <Target className="w-4 h-4" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground capitalize">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="border-2 border-[oklch(0.696_0.17_162.48/0.3)] rounded-2xl p-8 bg-[oklch(0.696_0.17_162.48/0.02)] text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[oklch(0.696_0.17_162.48/0.1)] flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-7 h-7 text-[oklch(0.596_0.145_163.225)]" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-1">
                      Analysis Complete!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Found <span className="font-semibold text-foreground">{matches.length} matching roles</span> from {totalJobs.toLocaleString()} live jobs
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-sm"
                      onClick={() => { setStep("idle"); setMatches([]); setFileName(null); }}
                    >
                      <Upload className="w-4 h-4 mr-1.5" />
                      Upload Another CV
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── Results Section ───────────────────────────────────────────────── */}
      {matches.length > 0 && (
        <section ref={resultsRef} className="py-16 md:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                    Your Job Matches
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {matches.length} roles matched from {totalJobs.toLocaleString()} live jobs — ranked by relevance
                  </p>
                </div>
                <Badge className="bg-[oklch(0.488_0.243_264.376/0.1)] text-[oklch(0.488_0.243_264.376)] border-0 text-sm px-3 py-1.5 hidden sm:flex">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  AI Ranked
                </Badge>
              </div>

              <div className="space-y-4">
                {displayedMatches.map((match, i) => {
                  const scoreColor = getScoreColor(match.fitScore);
                  const isExpanded = expandedJob === match.id;
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                    >
                      <Card className="border-border hover:border-[oklch(0.488_0.243_264.376/0.3)] hover:shadow-md hover:shadow-[oklch(0.488_0.243_264.376/0.05)] transition-all duration-300 rounded-2xl">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Score ring */}
                            <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-display font-bold text-sm ring-2 ${scoreColor.bg} ${scoreColor.text} ${scoreColor.ring}`}>
                              {match.fitScore}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="min-w-0">
                                  <h3 className="font-display font-bold text-base text-foreground truncate">
                                    {match.jobTitle}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    {match.company && (
                                      <span className="flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5" />
                                        {match.company}
                                      </span>
                                    )}
                                    {match.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {match.location}
                                      </span>
                                    )}
                                    {match.source && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded">
                                        {match.source}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge className={`${scoreColor.bg} ${scoreColor.text} border-0 text-xs whitespace-nowrap`}>
                                  {getScoreLabel(match.fitScore)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                {match.fitReason}
                              </p>
                              {match.salary && (
                                <p className="text-xs text-muted-foreground mt-1.5">
                                  Salary: {match.salary}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-3">
                                {match.jobLink && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg text-xs h-8"
                                    onClick={() => window.open(match.jobLink, "_blank")}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                    View Job
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-lg text-xs h-8"
                                  onClick={() => setExpandedJob(isExpanded ? null : match.id)}
                                >
                                  {isExpanded ? (
                                    <><ChevronUp className="w-3.5 h-3.5 mr-1" /> Less</>
                                  ) : (
                                    <><ChevronDown className="w-3.5 h-3.5 mr-1" /> Details</>
                                  )}
                                </Button>
                              </div>
                              <AnimatePresence>
                                {isExpanded && match.jobDescription && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 p-4 bg-muted/50 rounded-xl text-sm text-foreground leading-relaxed max-h-60 overflow-y-auto">
                                      {match.jobDescription.substring(0, 1500)}
                                      {match.jobDescription.length > 1500 && "..."}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
                {matches.length > 10 && !showAllMatches && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setShowAllMatches(true)}
                    >
                      Show All {matches.length} Matches
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 md:py-24 bg-card/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              How SpotRole AI Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to find your perfect role.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload Your CV",
                description: "Drop your CV in PDF or DOCX format. Your data is processed securely and never stored.",
                color: "oklch(0.488 0.243 264.376)",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Analyses Your Skills",
                description: "Our AI extracts your skills, experience, and preferences, then scrapes thousands of live jobs from Adzuna and Reed.",
                color: "oklch(0.696 0.17 162.48)",
              },
              {
                step: "03",
                icon: Target,
                title: "Get Ranked Matches",
                description: "Receive a personalised list of job matches ranked by relevance score, with explanations for each match.",
                color: "oklch(0.828 0.189 84.429)",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-6xl font-display font-black text-border/50 absolute top-6 right-6 select-none">
                  {item.step}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${item.color.replace("oklch", "oklch")}1a` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─────────────────────────────────────────────────── */}
      <section id="stats">
        <StatsSection />
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl bg-gradient-to-br from-[oklch(0.488_0.243_264.376)] to-[oklch(0.541_0.281_275.847)] p-10 md:p-14 text-center overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
              backgroundSize: "20px 20px"
            }} />
            <div className="relative">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                Ready to Find Your Perfect Role?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of job seekers who found their ideal role with SpotRole AI.
              </p>
              <Button
                onClick={scrollToUpload}
                className="bg-white text-[oklch(0.488_0.243_264.376)] hover:bg-white/90 rounded-xl font-display font-bold text-base px-8 py-5 shadow-xl transition-all duration-300"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload My CV Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  );
}
