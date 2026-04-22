/**
 * StatsSection — Key platform statistics for SpotRole AI
 * Design: Warm Modernism — stat cards with accent icons
 */
import { motion } from "framer-motion";
import { Briefcase, Target, Clock, TrendingUp, Mail } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      icon: Briefcase,
      value: "50K+",
      label: "Live Jobs Scraped",
      description: "From Adzuna & Reed daily",
      iconBg: "bg-[oklch(0.488_0.243_264.376/0.1)]",
      iconColor: "text-[oklch(0.488_0.243_264.376)]",
      cornerBg: "bg-[oklch(0.488_0.243_264.376)]",
    },
    {
      icon: Target,
      value: "92%",
      label: "Match Accuracy",
      description: "AI relevance score precision",
      iconBg: "bg-[oklch(0.696_0.17_162.48/0.1)]",
      iconColor: "text-[oklch(0.696_0.17_162.48)]",
      cornerBg: "bg-[oklch(0.696_0.17_162.48)]",
    },
    {
      icon: Clock,
      value: "< 2 min",
      label: "Analysis Time",
      description: "From upload to matched results",
      iconBg: "bg-[oklch(0.828_0.189_84.429/0.1)]",
      iconColor: "text-[oklch(0.828_0.189_84.429)]",
      cornerBg: "bg-[oklch(0.828_0.189_84.429)]",
    },
    {
      icon: TrendingUp,
      value: "10K+",
      label: "CVs Matched",
      description: "Job seekers helped so far",
      iconBg: "bg-[oklch(0.541_0.281_275.847/0.1)]",
      iconColor: "text-[oklch(0.541_0.281_275.847)]",
      cornerBg: "bg-[oklch(0.541_0.281_275.847)]",
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:shadow-[oklch(0.488_0.243_264.376/0.05)] transition-all duration-300 group overflow-hidden"
            >
              {/* Corner accent */}
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-3xl ${stat.cornerBg} opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-300`} />

              <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="font-display font-black text-3xl text-foreground mb-1">
                {stat.value}
              </div>
              <div className="font-display font-semibold text-sm text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
