import { getProjects } from "@/app/lib/projects/repository";

import ProjectCmsClient from "./ProjectCmsClient";

export default async function ProjectsHandlingPage() {
  const projects = await getProjects();

  return (
    <ProjectCmsClient
      key={projects.map((project) => project.id).join("|") || "empty"}
      initialProjects={projects}
    />
  );
}
