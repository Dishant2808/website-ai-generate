import type { HomepageData } from "@/types/homepage";

import { HomepageRenderer } from "./homepage/homepage-renderer";

type LandingPageProps = {
  data: HomepageData;
};

export function LandingPage({ data }: LandingPageProps) {
  return <HomepageRenderer data={data} />;
}
