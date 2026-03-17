import type { Project, ProjectCategory, ProjectSize } from "@/app/components/ProjectComponents/types";
import { sql } from "@/lib/db/client";

type ProjectRow = {
  id: string;
  title: string;
  category: ProjectCategory;
  tagline: string;
  description: string;
  stack: string[];
  complexity: number;
  size: ProjectSize;
  image: string;
  image_mobile: string | null;
  link: string | null;
  stat: string | null;
  sort_order: number;
};

function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    stack: Array.isArray(row.stack) ? row.stack : [],
    complexity: row.complexity,
    size: row.size,
    image: row.image,
    imageMobile: row.image_mobile ?? undefined,
    link: row.link ?? undefined,
    stat: row.stat ?? undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  const rows = await sql<ProjectRow[]>`
    select
      id,
      title,
      category,
      tagline,
      description,
      stack,
      complexity,
      size,
      image,
      image_mobile,
      link,
      stat,
      sort_order
    from projects
    order by sort_order asc, created_at asc
  `;

  return rows.map(mapProjectRow);
}

export async function replaceProjects(projects: Project[]) {
  const connection = await sql.reserve();

  try {
    await connection`begin`;
    await connection`delete from projects`;

    for (const [index, project] of projects.entries()) {
      await connection`
        insert into projects (
          id,
          title,
          category,
          tagline,
          description,
          stack,
          complexity,
          size,
          image,
          image_mobile,
          link,
          stat,
          sort_order
        ) values (
          ${project.id},
          ${project.title},
          ${project.category},
          ${project.tagline},
          ${project.description},
          ${connection.json(project.stack)},
          ${project.complexity},
          ${project.size},
          ${project.image},
          ${project.imageMobile ?? null},
          ${project.link ?? null},
          ${project.stat ?? null},
          ${index}
        )
      `;
    }

    await connection`commit`;
  } catch (error) {
    await connection`rollback`;
    throw error;
  } finally {
    connection.release();
  }
}
