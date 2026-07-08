import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { getGenerationRecord } from "@/lib/generation-store";

type RenderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RenderPage({ params }: RenderPageProps) {
  const { id } = await params;
  const record = await getGenerationRecord(id);

  if (!record) {
    notFound();
  }

  return (
    <main className="bg-white">
      <LandingPage data={record.landingPageData} />
    </main>
  );
}
