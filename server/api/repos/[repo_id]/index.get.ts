import { repoSchema } from '../../../schemas';
import { eq } from 'drizzle-orm';

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

  const repoId = event.context.params?.repo_id;
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  await requireAccessToRepo(user, parseInt(repoId, 10));

  const repo = await db
    .select()
    .from(repoSchema)
    .where(eq(repoSchema.id, Number(repoId)))
    .get();

  if (!repo) {
    return sendError(
      event,
      createError({
        statusCode: 404,
        message: 'Repo not found',
      }),
    );
  }

  return repo;
});
