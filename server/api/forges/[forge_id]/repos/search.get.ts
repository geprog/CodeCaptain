import { RepoFromDB, repoSchema, userReposSchema } from '../../../../schemas';
import { and, eq, inArray } from 'drizzle-orm';

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

  const forgeId = event.context.params?.forge_id;
  if (!forgeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'forgeId is required',
    });
  }
  const forge = await getUserForgeAPI(user, parseInt(forgeId, 10));

  const search = ((getQuery(event)?.search as string | undefined) || '').trim();

  // TODO: use caching along with the db query
  let activeRepos: RepoFromDB[] = [];
  const repoIdsForUser = await db.select().from(userReposSchema).where(eq(userReposSchema.userId, user.id)).all();
  if (repoIdsForUser && repoIdsForUser.length !== 0) {
    activeRepos = await db
      .select()
      .from(repoSchema)
      .where(
        and(
          inArray(
            repoSchema.id,
            repoIdsForUser.map((r) => r.repoId),
          ),
          eq(repoSchema.forgeId, Number(forgeId)),
        ),
      )
      .all();
  }

  const userRepos = await forge.getRepos(search);

  return userRepos.items.map((repo) => ({
    id: repo.id.toString(),
    name: repo.name,
    active: activeRepos.map((ar) => ar.id).includes(repo.id),
  }));
});
