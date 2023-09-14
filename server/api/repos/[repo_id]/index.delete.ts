import * as path from 'path';
import { promises as fs } from 'fs';
import { repoSchema, userReposSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const _repoId = event.context.params?.repo_id;
  if (!_repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }
  const repoId = parseInt(_repoId, 10);

  const repo = await requireAccessToRepo(user, repoId);

  const config = useRuntimeConfig();
  const folder = path.join(config.data_path, repo.id.toString());

  await createDataFolder();

  try {
    await fs.rm(folder, { recursive: true });
  } catch (e) {
    console.error('error while deleting repo folder', e);
  }

  await db.delete(userReposSchema).where(eq(userReposSchema.repoId, repoId)).run();
  await db.delete(repoSchema).where(eq(repoSchema.id, repoId)).run();

  return 'ok';
});
