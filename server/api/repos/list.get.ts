import { repoSchema, userReposSchema } from '../../schemas';
import { eq, inArray } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await getUserFromCookie(event);
  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
  }

  const userRepoIds = (await db.select().from(userReposSchema).where(eq(userReposSchema.userId, user.id)).all()).map(
    (i) => i.repoId,
  );

  if (!userRepoIds || userRepoIds.length === 0) {
    return [];
  }

  const repos = await db.select().from(repoSchema).where(inArray(repoSchema.id, userRepoIds)).all();

  return repos;
});
