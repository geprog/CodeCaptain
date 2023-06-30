import { Octokit } from "octokit";
import { promises as fs } from "fs";
import * as path from "path";

async function dirExists(path: string) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export default defineEventHandler(async (event) => {
  // const token = getCookie(event, "gh_token");
  const token = getHeader(event, "gh_token");
  const octokit = new Octokit({ auth: token });
  const config = useRuntimeConfig();
  const dataFolder = config.data_path;

  // TODO: check user access to repo

  if (!(await dirExists(dataFolder))) {
    await fs.mkdir(dataFolder, { recursive: true });
  }

  const repos: { id: string; full_name: string; active: boolean }[] = [];

  const repoFolders = await fs.readdir(dataFolder, { withFileTypes: true });
  for (const dirent of repoFolders) {
    if (!dirent.isDirectory()) continue;
    const info = JSON.parse(
      await fs.readFile(
        path.join(dataFolder, dirent.name, "repo.json"),
        "utf-8"
      )
    );

    repos.push({
      id: dirent.name,
      full_name: info.full_name,
      active: true,
    });
  }

  return repos;
});
