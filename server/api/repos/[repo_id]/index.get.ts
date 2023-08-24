import { promises as fs } from 'fs';
import * as path from 'path';
import { repoSchema, userReposSchema } from '../../../schemas';
import { eq } from 'drizzle-orm';

async function dirExists(path: string) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const dataFolder = path.join(config.data_path);
  if (!(await dirExists(dataFolder))) {
    await fs.mkdir(dataFolder, { recursive: true });
  }

  const repoId = event.context.params?.repo_id;
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

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

  const repoForUser = await db
    .select()
    .from(userReposSchema)
    .where(eq(userReposSchema.repoId, Number(repoId)))
    .get();
  if (repoForUser && repoForUser.userId === user.id) {
    throw new Error(`user :${user.name} does not have access to repo with id:${repoId}`);
  }

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
