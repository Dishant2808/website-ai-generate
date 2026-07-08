"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  Palette,
  RefreshCcw,
  Star,
} from "lucide-react";

import { BrowserMockup } from "@/components/browser-mockup";
import { LandingPage } from "@/components/landing-page";
import {
  clearGenerationResult,
  loadGenerationResult,
  type GenerationResult,
} from "@/lib/client-store";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadGenerationResult();
    const id = searchParams.get("id");

    if (!stored || (id && stored.generationId !== id)) {
      router.replace("/");
      return;
    }

    setResult(stored);
  }, [router, searchParams]);

  const sources = useMemo(() => {
    if (!result) {
      return [];
    }

    const badges = ["Google Business"];
    if (result.businessData.socialLinks.instagramUrl) {
      badges.push("Instagram");
    }
    if (result.businessData.socialLinks.facebookUrl) {
      badges.push("Facebook");
    }
    return badges;
  }, [result]);

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const fetchExportImage = async (download: boolean) => {
    if (!result) {
      return;
    }

    setExportError(null);
    if (download) {
      setExporting(true);
    } else {
      setPreviewLoading(true);
    }

    try {
      const response = await fetch(`/api/export/${result.generationId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Export failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setPreviewImageUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return url;
      });

      if (download) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${result.landingPageData.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-website.png`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExporting(false);
      setPreviewLoading(false);
    }
  };

  const handleExport = async () => {
    await fetchExportImage(true);
  };

  useEffect(() => {
    if (!result) {
      return;
    }
    void fetchExportImage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading preview...
      </main>
    );
  }

  const { landingPageData, generationTimeMs, businessData } = result;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF2FF_50%,#F8FAFC_100%)]">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                AI Website Generated Successfully
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {landingPageData.businessName}
                </h1>
                <p className="mt-1 text-slate-600">
                  {landingPageData.category ?? businessData.category ?? "Business website"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                {landingPageData.rating !== undefined ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {landingPageData.rating.toFixed(1)} Google Rating
                  </span>
                ) : null}
                {landingPageData.reviewCount !== undefined ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {landingPageData.reviewCount} reviews
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-violet-700">
                  <Palette className="h-3.5 w-3.5" />
                  Theme: {landingPageData.design.theme}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
                  <Clock3 className="h-3.5 w-3.5" />
                  {(generationTimeMs / 1000).toFixed(1)}s generation
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Data Sources
                </span>
                {sources.map((source) => (
                  <span
                    key={source}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  clearGenerationResult();
                  router.push("/");
                }}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Generate Again
              </button>
            </div>
          </div>

          {exportError ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {exportError}
            </p>
          ) : null}
        </motion.section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Image Preview</h2>
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
            {previewLoading ? (
              <div className="flex h-[420px] items-center justify-center text-slate-500">
                Generating preview image...
              </div>
            ) : previewImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImageUrl}
                alt="Generated website screenshot preview"
                className="h-auto w-full"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-slate-500">
                Preview image not available.
              </div>
            )}
          </div>
          <div className="flex">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-70"
            >
              <Camera className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export Screenshot"}
            </button>
          </div>
        </section>

        <section className="hidden space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Website Preview</h2>
          <BrowserMockup data={landingPageData}>
            <LandingPage data={landingPageData} />
          </BrowserMockup>
        </section>
      </div>
    </main>
  );
}
