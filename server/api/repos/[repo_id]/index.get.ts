import { Octokit } from 'octokit';
import { promises as fs } from 'fs';
import * as path from 'path';

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
  const token = getHeader(event, 'gh_token');
  const octokit = new Octokit({ auth: token });

  // TODO: check user access to repo

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

  const body = await fs.readFile(path.join(dataFolder, repoId, 'repo.json'), 'utf-8');

  const repo = JSON.parse(body);

  return {
    id: repo.id,
    full_name: repo.full_name,
    link: repo.html_url,
    active: true,
  };
});
