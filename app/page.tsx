"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  Sparkles,
  Wand2,
  ArrowDown,
} from "lucide-react";

import { BusinessForm } from "@/components/business-form";
import { saveFormValues } from "@/lib/client-store";
import type { BusinessFormValues } from "@/types";

const features = [
  {
    title: "AI Analysis",
    description: "Extract reviews, branding signals, photos, and business details automatically.",
    icon: Sparkles,
  },
  {
    title: "Website Generation",
    description: "Create a premium Framer-style landing page with unique copy and theme.",
    icon: Wand2,
  },
  {
    title: "Screenshot Export",
    description: "Export a pixel-perfect screenshot of the exact Website Preview.",
    icon: Camera,
  },
];

const steps = [
  "Paste Business Links",
  "AI analyzes Google Business",
  "Beautiful Website Generated",
];

export default function HomePage() {
  const router = useRouter();

  const handleSubmit = (values: BusinessFormValues) => {
    saveFormValues(values);
    router.push("/generating");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070A14] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_45%),radial-gradient(circle_at_80%_20%,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,#070A14_0%,#0B1224_55%,#111827_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-wide">AI Website Generator</span>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
            Demo Ready
          </span>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-6"
          >
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
              Lovable-style AI SaaS
            </p>
            <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Generate Beautiful Business Websites Using AI
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              Paste your Google Business Profile and social links. Our AI analyzes your business,
              extracts reviews, branding, images, and generates a beautiful website in seconds.
            </p>
          </motion.div>

          <BusinessForm onSubmit={handleSubmit} />
        </section>

        <section className="mt-24 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-400/20">
                <feature.icon className="h-5 w-5 text-cyan-200" />
              </div>
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.description}</p>
            </motion.article>
          ))}
        </section>

        <section className="mt-24 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it Works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
            {steps.map((step, index) => (
              <div key={step} className="contents">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-3xl border border-white/10 bg-[#0B1224]/80 p-6"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Step {index + 1}</p>
                  <p className="mt-3 text-lg font-medium">{step}</p>
                </motion.div>
                {index < steps.length - 1 ? (
                  <div className="hidden justify-center md:flex">
                    <ArrowDown className="h-5 w-5 rotate-[-90deg] text-white/40" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
