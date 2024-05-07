import path from 'node:path';
import fs from 'node:fs/promises';
import { orgReposSchema, repoSchema } from '../schemas';
import { eq } from 'drizzle-orm';

export async function deleteRepo(repoId: number) {
  const config = useRuntimeConfig();
  const folder = path.join(config.data_path, repoId.toString());

  await createDataFolder();

  try {
    await fs.rm(folder, { recursive: true });
  } catch (e) {
    console.error('error while deleting repo folder', e);
  }

  await db.delete(orgReposSchema).where(eq(orgReposSchema.repoId, repoId)).run();
  await db.delete(repoSchema).where(eq(repoSchema.id, repoId)).run();

  await deleteRepoVectorStore(repoId);

  return 'ok';
}
