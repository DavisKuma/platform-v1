/**
 * CvAnalysis — Upload your CV, get it analysed by AI,
 * and matched against live jobs from Adzuna & Reed APIs.
 */
import { useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload, FileText, CheckCircle2, Sparkles, ArrowRight,
  ExternalLink, MapPin, Building2, Loader2, AlertCircle,
  Brain, ChevronDown, ChevronUp, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

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

type AnalysisStep = "idle" | "uploading" | "processing" | "done" | "error";

const STEP_LABELS: Record<AnalysisStep, string> = {
  idle: "Ready to upload",
  uploading: "Uploading your CV...",
  processing: "Processing your CV...",
  done: "Analysis complete!",
  error: "Something went wrong",
};

/** Map backend progress strings to approximate bar percentages. */
function progressToPercent(msg: string): number {
  if (!msg) return 20;
  const lower = msg.toLowerCase();
  if (lower.includes("starting")) return 15;
  if (lower.includes("scraping") || lower.includes("analysing cv")) return 25;
  if (lower.includes("extracting cv")) return 30;
  if (lower.includes("filtering")) return 40;
  if (lower.includes("scoring")) {
    // "Scored 30/75 jobs" → parse fraction for smooth progress
    const m = msg.match(/Scored\s+(\d+)\s*\/\s*(\d+)/i);
    if (m) {
      const pct = parseInt(m[1], 10) / parseInt(m[2], 10);
      return Math.round(50 + pct * 40); // 50-90%
    }
    return 50;
  }
  if (lower.includes("done")) return 95;
  return 20;
}

/** Map percent to active stepper phase (0-3). */
function percentToPhase(pct: number): number {
  if (pct >= 90) return 3;
  if (pct >= 40) return 2;
  if (pct >= 15) return 1;
  return 0;
}

const PHASES = [
  { icon: Upload, label: "Upload" },
  { icon: Brain, label: "Analyse" },
  { icon: Sparkles, label: "Match" },
  { icon: CheckCircle2, label: "Done" },
] as const;

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

export default function CvAnalysis() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<AnalysisStep>("idle");
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type)) { toast.error("Please upload a PDF or DOCX file."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large. Maximum 10MB."); return; }

    setFileName(file.name);
    setStep("uploading");
    setErrorMsg(null);
    setMatches([]);
    setProgressMsg("");
    setProgressPercent(10);

    try {
      setStep("processing");
      const result = await api.matchJobs(file, 20, (progress) => {
        setProgressMsg(progress);
        setProgressPercent(progressToPercent(progress));
      });

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
      toast.success(`Found ${mapped.length} matching roles!`);
    } catch (error: any) {
      setStep("error");
      setErrorMsg(error.message || "Analysis failed. Please try again.");
      toast.error(error.message || "Analysis failed");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const displayedMatches = showAllMatches ? matches : matches.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[oklch(0.488_0.243_264.376/0.1)] flex items-center justify-center">
              <Brain className="w-5 h-5 text-[oklch(0.488_0.243_264.376)]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">CV Analysis &amp; Job Matching</h1>
              <p className="text-sm text-muted-foreground">Upload your CV — AI analyses it and matches you with live sponsor-verified jobs</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "idle" || step === "error" ? (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mb-10">
              <Card className="border-2 border-dashed border-border hover:border-[oklch(0.488_0.243_264.376/0.4)] transition-colors">
                <CardContent className="p-8 sm:p-12">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`text-center transition-all duration-300 rounded-2xl p-6 ${isDragging ? "bg-[oklch(0.488_0.243_264.376/0.05)] scale-[1.01]" : ""}`}
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[oklch(0.488_0.243_264.376/0.08)] flex items-center justify-center mb-5">
                      <Upload className="w-8 h-8 text-[oklch(0.488_0.243_264.376)]" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-2">Upload Your CV</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Drop your PDF or DOCX here. AI will analyse your skills, experience, and preferences,
                      then match you with the best roles from Adzuna &amp; Reed.
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()} className="bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.441_0.243_264.376)] text-white rounded-xl font-display font-semibold shadow-lg shadow-[oklch(0.488_0.243_264.376/0.25)] px-8 py-6 text-base">
                      <Upload className="w-5 h-5 mr-2" /> Choose File
                    </Button>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.doc" onChange={handleFileInput} />
                    <p className="text-xs text-muted-foreground mt-4">Supports PDF and DOCX — max 10MB</p>
                  </div>
                  {step === "error" && errorMsg && (
                    <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-destructive">{errorMsg}</p>
                        <p className="text-xs text-muted-foreground mt-1">Try uploading a different file or check the format.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : step !== "done" ? (
            <motion.div key="processing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mb-10">
              <Card className="border-border overflow-hidden">
                {/* gradient accent bar */}
                <div className="h-1 bg-gradient-to-r from-[oklch(0.488_0.243_264.376)] via-[oklch(0.6_0.2_300)] to-[oklch(0.696_0.17_162.48)]" />
                <CardContent className="p-8 sm:p-12">
                  <div className="space-y-8">
                    {/* ── Stepper ── */}
                    <div className="flex items-center justify-between max-w-lg mx-auto">
                      {PHASES.map((phase, i) => {
                        const active = percentToPhase(progressPercent);
                        const completed = i < active;
                        const isCurrent = i === active;
                        const Icon = phase.icon;
                        return (
                          <div key={phase.label} className="flex items-center flex-1 last:flex-none">
                            {/* circle */}
                            <div className="flex flex-col items-center gap-1.5 relative">
                              <motion.div
                                animate={isCurrent ? { scale: [1, 1.12, 1] } : {}}
                                transition={isCurrent ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : {}}
                                className={`
                                  relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500
                                  ${completed
                                    ? "bg-[oklch(0.696_0.17_162.48)] shadow-lg shadow-[oklch(0.696_0.17_162.48/0.3)]"
                                    : isCurrent
                                      ? "bg-[oklch(0.488_0.243_264.376)] shadow-lg shadow-[oklch(0.488_0.243_264.376/0.4)]"
                                      : "bg-muted"
                                  }
                                `}
                              >
                                {completed ? (
                                  <Check className="w-5 h-5 text-white" />
                                ) : isCurrent ? (
                                  <Icon className="w-5 h-5 text-white" />
                                ) : (
                                  <Icon className="w-5 h-5 text-muted-foreground/50" />
                                )}
                                {isCurrent && (
                                  <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-[oklch(0.488_0.243_264.376)]"
                                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                  />
                                )}
                              </motion.div>
                              <span className={`text-[11px] font-medium transition-colors duration-300 ${completed || isCurrent ? "text-foreground" : "text-muted-foreground/50"}`}>
                                {phase.label}
                              </span>
                            </div>
                            {/* connector line */}
                            {i < PHASES.length - 1 && (
                              <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-[oklch(0.696_0.17_162.48)] to-[oklch(0.488_0.243_264.376)]"
                                  initial={{ width: "0%" }}
                                  animate={{ width: completed ? "100%" : isCurrent ? "50%" : "0%" }}
                                  transition={{ duration: 0.6, ease: "easeOut" }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ── Status text ── */}
                    <div className="text-center space-y-3">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={progressMsg}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          className="font-display font-semibold text-lg text-foreground"
                        >
                          {progressMsg || STEP_LABELS[step]}
                        </motion.p>
                      </AnimatePresence>
                      {fileName && (
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4" /> {fileName}
                        </p>
                      )}
                    </div>

                    {/* ── Gradient progress bar ── */}
                    <div className="max-w-md mx-auto">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[oklch(0.488_0.243_264.376)] via-[oklch(0.6_0.2_300)] to-[oklch(0.696_0.17_162.48)]"
                          initial={{ width: "0%" }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-3">This usually takes 20-40 seconds</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {step === "done" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[oklch(0.696_0.17_162.48/0.08)] border border-[oklch(0.696_0.17_162.48/0.2)]">
              <CheckCircle2 className="w-6 h-6 text-[oklch(0.596_0.145_163.225)] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">CV analysed — {matches.length} job matches found</p>
                <p className="text-xs text-muted-foreground">Scored from {totalJobs} sponsor-matched roles via Adzuna &amp; Reed</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setStep("idle"); setMatches([]); }}>
                <Upload className="w-4 h-4 mr-1.5" /> Upload Different CV
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[oklch(0.488_0.243_264.376)]" /> {matches.length} Job Matches
                </h2>
                <p className="text-sm text-muted-foreground">Scored from {totalJobs} sponsor-matched roles via Adzuna &amp; Reed</p>
              </div>
            </div>

            {matches.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium">No matching jobs found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try uploading a different CV or try again later.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayedMatches.map((match, i) => {
                  const scoreColor = getScoreColor(match.fitScore);
                  const isExpanded = expandedJob === match.id;
                  return (
                    <motion.div key={match.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border-border hover:shadow-md transition-all duration-200">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${scoreColor.bg} ring-1 ${scoreColor.ring} flex flex-col items-center justify-center`}>
                              <span className={`font-display font-bold text-lg ${scoreColor.text}`}>{match.fitScore}</span>
                              <span className={`text-[9px] font-medium ${scoreColor.text}`}>FIT</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-display font-semibold text-foreground text-base leading-tight">{match.jobTitle}</h3>
                                  <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{match.company}</span>
                                    {match.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{match.location}</span>}
                                    {match.source && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded">{match.source}</Badge>}
                                  </div>
                                </div>
                                <Badge className={`${scoreColor.bg} ${scoreColor.text} border-0 text-xs whitespace-nowrap`}>{getScoreLabel(match.fitScore)}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{match.fitReason}</p>
                              {match.salary && match.salary !== " - " && <p className="text-xs text-muted-foreground mt-1.5">Salary: {match.salary}</p>}
                              <div className="flex items-center gap-2 mt-3">
                                {match.jobLink && (
                                  <Button variant="outline" size="sm" className="rounded-lg text-xs h-8" onClick={() => window.open(match.jobLink, "_blank")}>
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Job
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8" onClick={() => setExpandedJob(isExpanded ? null : match.id)}>
                                  {isExpanded ? <><ChevronUp className="w-3.5 h-3.5 mr-1" /> Less</> : <><ChevronDown className="w-3.5 h-3.5 mr-1" /> Details</>}
                                </Button>
                              </div>
                              <AnimatePresence>
                                {isExpanded && match.jobDescription && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="mt-3 p-4 bg-muted/50 rounded-xl text-sm text-foreground leading-relaxed max-h-60 overflow-y-auto">
                                      {match.jobDescription.substring(0, 1500)}{match.jobDescription.length > 1500 && "..."}
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
                    <Button variant="outline" className="rounded-xl" onClick={() => setShowAllMatches(true)}>
                      Show All {matches.length} Matches <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
