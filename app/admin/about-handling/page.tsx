import { getAboutMilestones } from "@/app/lib/about/repository";

import AboutCmsClient from "./AboutCmsClient";

export default async function AboutHandlingPage() {
  const milestones = await getAboutMilestones();

  return (
    <AboutCmsClient
      key={milestones.map((milestone) => milestone.id).join("|") || "seed"}
      initialMilestones={milestones}
    />
  );
}
