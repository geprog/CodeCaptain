import { repoSchema, userReposSchema } from '~/server/schemas';
import { eq, inArray } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const userRepoIds = (await db.select().from(userReposSchema).where(eq(userReposSchema.userId, user.id)).all()).map(
    (i) => i.repoId,
  );

  if (!userRepoIds || userRepoIds.length === 0) {
    return [];
  }

  const repos = await db.select().from(repoSchema).where(inArray(repoSchema.id, userRepoIds)).all();

  return repos;
});
