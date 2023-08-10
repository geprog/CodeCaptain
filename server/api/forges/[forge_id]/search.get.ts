import { promises as fs } from 'fs';
import { getUserForgeAPI } from '../../../utils/auth';

async function dirExists(path: string) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const forgeId = event.context.params?.forge_id;
  if (!forgeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'forgeId is required',
    });
  }

  const search = ((getQuery(event)?.search as string | undefined) || '').trim();

  const config = useRuntimeConfig();
  const dataFolder = config.data_path;
  if (!(await dirExists(dataFolder))) {
    await fs.mkdir(dataFolder, { recursive: true });
  }
  // TODO: load active repos from db
  const activeRepos = (await fs.readdir(dataFolder, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const user = await getUserFromCookie(event);
  if (!user) {
    throw new Error('User not found');
  }

  const forge = await getUserForgeAPI(user, parseInt(forgeId, 10));

  const userRepos = await forge.getRepos(search);

  return userRepos.map((repo) => ({
    id: repo.id.toString(),
    name: repo.name,
    active: activeRepos.includes(repo.id.toString()),
  }));
});
