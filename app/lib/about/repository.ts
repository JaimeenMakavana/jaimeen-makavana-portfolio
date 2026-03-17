import { sql } from "@/lib/db/client";

export type AboutMilestone = {
  id: string;
  era: string;
  title: string;
  description: string;
  image: string;
};

type AboutMilestoneRow = AboutMilestone & {
  sort_order: number;
};

export async function getAboutMilestones(): Promise<AboutMilestone[]> {
  const rows = await sql<AboutMilestoneRow[]>`
    select id, era, title, description, image, sort_order
    from about_milestones
    order by sort_order asc, created_at asc
  `;

  return rows.map((row) => ({
    id: row.id,
    era: row.era,
    title: row.title,
    description: row.description,
    image: row.image,
  }));
}

export async function replaceAboutMilestones(milestones: AboutMilestone[]) {
  const connection = await sql.reserve();

  try {
    await connection`begin`;
    await connection`delete from about_milestones`;

    if (milestones.length === 0) {
      await connection`commit`;
      return;
    }

    const rows = milestones.map((milestone, index) => ({
      ...milestone,
      sort_order: index,
    }));

    for (const row of rows) {
      await connection`
        insert into about_milestones (
          id,
          era,
          title,
          description,
          image,
          sort_order
        ) values (
          ${row.id},
          ${row.era},
          ${row.title},
          ${row.description},
          ${row.image},
          ${row.sort_order}
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

export async function deleteAboutMilestones() {
  await sql`delete from about_milestones`;
}
