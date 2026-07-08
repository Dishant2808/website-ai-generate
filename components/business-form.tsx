"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Check,
  Globe2,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BusinessFormValues } from "@/types";

const optionalUrl = z
  .union([z.literal(""), z.string().url("Please enter a valid URL.")])
  .transform((value) => value.trim());

export const businessFormSchema = z.object({
  googleBusinessProfileUrl: z
    .string()
    .trim()
    .min(1, "Google Business Profile URL is required.")
    .url("Please enter a valid Google Business Profile URL."),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
});

type BusinessFormProps = {
  onSubmit: (values: BusinessFormValues) => void | Promise<void>;
  isLoading?: boolean;
};

const benefits = [
  "AI Business Analysis",
  "Google Reviews",
  "Business Images",
  "Auto Branding",
  "AI Generated Website",
];

export function BusinessForm({ onSubmit, isLoading = false }: BusinessFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      googleBusinessProfileUrl: "",
      instagramUrl: "",
      facebookUrl: "",
    },
  });

  const loading = isLoading || isSubmitting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

      <form className="relative space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <label htmlFor="googleBusinessProfileUrl" className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <MapPin className="h-4 w-4 text-violet-600" />
            Google Business Profile URL <span className="text-rose-500">*</span>
          </label>
          <input
            id="googleBusinessProfileUrl"
            type="url"
            placeholder="https://maps.google.com/..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-200/60"
            {...register("googleBusinessProfileUrl")}
          />
          {errors.googleBusinessProfileUrl ? (
            <p className="text-sm text-rose-500">{errors.googleBusinessProfileUrl.message}</p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="instagramUrl" className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Globe2 className="h-4 w-4 text-pink-500" />
              Instagram URL
            </label>
            <input
              id="instagramUrl"
              type="url"
              placeholder="https://instagram.com/yourbrand"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-200/60"
              {...register("instagramUrl")}
            />
            {errors.instagramUrl ? (
              <p className="text-sm text-rose-500">{errors.instagramUrl.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="facebookUrl" className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Globe2 className="h-4 w-4 text-blue-600" />
              Facebook URL
            </label>
            <input
              id="facebookUrl"
              type="url"
              placeholder="https://facebook.com/yourbrand"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-200/60"
              {...register("facebookUrl")}
            />
            {errors.facebookUrl ? (
              <p className="text-sm text-rose-500">{errors.facebookUrl.message}</p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-95"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? "Starting AI..." : "Generate Website"}
        </Button>

        <div className="grid gap-2 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-3 w-3" />
              </span>
              {benefit}
            </div>
          ))}
        </div>
      </form>
    </motion.div>
  );
}
