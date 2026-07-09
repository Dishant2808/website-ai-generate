import type { HomepageData } from "@/types/homepage";
import type { BusinessData, BusinessFormValues } from "@/types";

const FORM_KEY = "ai-website-generator:form";
const RESULT_KEY = "ai-website-generator:result";

export type GenerationResult = {
  generationId: string;
  generationTimeMs: number;
  businessData: BusinessData;
  landingPageData: HomepageData;
};

export function saveFormValues(values: BusinessFormValues) {
  sessionStorage.setItem(FORM_KEY, JSON.stringify(values));
}

export function loadFormValues(): BusinessFormValues | null {
  const raw = sessionStorage.getItem(FORM_KEY);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as BusinessFormValues;
}

export function saveGenerationResult(result: GenerationResult) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadGenerationResult(): GenerationResult | null {
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as GenerationResult;
}

export function clearGenerationResult() {
  sessionStorage.removeItem(RESULT_KEY);
}
