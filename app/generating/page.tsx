"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Sparkles } from "lucide-react";

import {
  loadFormValues,
  saveGenerationResult,
} from "@/lib/client-store";
import type { LandingPageData } from "@/lib/openai";
import type { BusinessData } from "@/types";

const STEPS = [
  "Reading Google Business...",
  "Reading Instagram...",
  "Collecting Reviews...",
  "Analyzing Images...",
  "Understanding Business...",
  "Choosing Color Palette...",
  "Building Website...",
  "Optimizing Layout...",
  "Finalizing...",
] as const;

type GenerateApiResponse =
  | {
      success: true;
      data: {
        generationId: string;
        generationTimeMs: number;
        businessData: BusinessData;
        landingPageData: LandingPageData;
      };
    }
  | {
      success: false;
      error: string;
    };

export default function GeneratingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const progress = useMemo(
    () => Math.min(100, Math.round(((activeStep + 1) / STEPS.length) * 100)),
    [activeStep]
  );

  useEffect(() => {
    const values = loadFormValues();
    if (!values) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();

    const stepTimer = window.setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 900);

    const run = async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            googleBusinessUrl: values.googleBusinessProfileUrl,
            instagramUrl: values.instagramUrl || undefined,
            facebookUrl: values.facebookUrl || undefined,
          }),
        });

        const payload = (await response.json()) as GenerateApiResponse;

        if (!response.ok || !payload.success) {
          throw new Error(!payload.success ? payload.error : "Generation failed.");
        }

        if (cancelled) {
          return;
        }

        saveGenerationResult({
          generationId: payload.data.generationId,
          generationTimeMs: payload.data.generationTimeMs,
          businessData: payload.data.businessData,
          landingPageData: payload.data.landingPageData,
        });

        // Warm screenshot generation during loading so preview feels instant.
        await Promise.race([
          fetch(`/api/export/${payload.data.generationId}`, { method: "POST" }),
          new Promise((resolve) => setTimeout(resolve, 9000)),
        ]);

        setActiveStep(STEPS.length - 1);
        setDone(true);

        const remaining = Math.max(700, 1200 - (Date.now() - startedAt) % 1000);
        window.setTimeout(() => {
          router.replace(`/preview?id=${payload.data.generationId}`);
        }, remaining);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Generation failed.");
        }
      } finally {
        window.clearInterval(stepTimer);
      }
    };

    void run();

    return () => {
      cancelled = true;
      window.clearInterval(stepTimer);
    };
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070A14] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.35),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.2),_transparent_35%)]" />

      <div className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Generation</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Crafting your website
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Analyzing links, selecting branding, and assembling a premium landing page.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
            {done ? <Sparkles className="h-5 w-5" /> : <LoaderCircle className="h-5 w-5 animate-spin" />}
          </div>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        </div>

        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const isActive = index === activeStep;
            const isDone = index < activeStep || done;

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                  isActive
                    ? "border-cyan-300/40 bg-cyan-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className={`text-sm ${isDone || isActive ? "text-white" : "text-slate-400"}`}>
                  {step}
                </p>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${step}-${isDone}-${isActive}`}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`h-2.5 w-2.5 rounded-full ${
                      isDone ? "bg-emerald-400" : isActive ? "animate-pulse bg-cyan-300" : "bg-white/20"
                    }`}
                  />
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {error ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900"
            >
              Back to homepage
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
