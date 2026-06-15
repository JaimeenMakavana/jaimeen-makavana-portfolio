export const dynamic = "force-dynamic";

import { getAboutMilestones } from "@/app/lib/about/repository";

import AboutCmsClient from "./AboutCmsClient";

export default async function AboutHandlingPage() {
  const milestones = await getAboutMilestones();

  return <AboutCmsClient initialMilestones={milestones} />;
}
