import { promises as fs } from 'fs';
import * as path from 'path';
import { userReposSchema } from '../../../schemas';
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

  if(user){
    const repoForUser = await db.select().from(userReposSchema).where(eq(userReposSchema.repoId, Number(repoId))).get();
    const hasAcess = repoForUser && repoForUser.userId === user.id;
    if(!hasAcess){
      throw new Error(`user :${user.name} does not have access to repo with id:${repoId}`)
    }
  }else{
    throw new Error('user not found while trying to fetch repo');
  }

  const body = await fs.readFile(path.join(dataFolder, repoId, 'repo.json'), 'utf-8');

  const repo = JSON.parse(body);

  return {
    id: repo.id,
    full_name: repo.full_name,
    link: repo.html_url,
    active: true,
  };
});
