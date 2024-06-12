import { orgMemberSchema, orgReposSchema, repoSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const repos = await db
    .select()
    .from(repoSchema)
    .innerJoin(orgReposSchema, eq(repoSchema.id, orgReposSchema.repoId))
    .innerJoin(orgMemberSchema, eq(orgMemberSchema.orgId, orgReposSchema.orgId))
    .where(eq(orgMemberSchema.userId, user.id))
    .all();

  return repos.flatMap((r) => r.repos);
});
