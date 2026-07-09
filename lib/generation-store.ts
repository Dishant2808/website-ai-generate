import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import type { HomepageData } from "@/types/homepage";
import type { BusinessData } from "@/types";

const STORE_DIR = join(tmpdir(), "ai-website-generator-runs");

export type GenerationRecord = {
  id: string;
  createdAt: string;
  generationTimeMs: number;
  businessData: BusinessData;
  landingPageData: HomepageData;
};

export async function saveGenerationRecord(
  input: Omit<GenerationRecord, "id" | "createdAt"> & { id?: string }
): Promise<GenerationRecord> {
  await mkdir(STORE_DIR, { recursive: true });

  const record: GenerationRecord = {
    id: input.id ?? randomUUID(),
    createdAt: new Date().toISOString(),
    generationTimeMs: input.generationTimeMs,
    businessData: input.businessData,
    landingPageData: input.landingPageData,
  };

  await writeFile(join(STORE_DIR, `${record.id}.json`), JSON.stringify(record), "utf8");
  return record;
}

export async function getGenerationRecord(id: string): Promise<GenerationRecord | null> {
  if (!/^[a-f0-9-]+$/i.test(id)) {
    return null;
  }

  try {
    const raw = await readFile(join(STORE_DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as GenerationRecord;
  } catch {
    return null;
  }
}
