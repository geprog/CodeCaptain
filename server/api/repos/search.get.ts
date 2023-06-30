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
  const search = ((getQuery(event)?.search as string | undefined) || "").trim();

  const user = (await octokit.request("GET /user")).data;

  const dataFolder = path.join("data", user.login);

  if (!(await dirExists(dataFolder))) {
    await fs.mkdir(dataFolder, { recursive: true });
  }

  const activeRepos = (await fs.readdir(dataFolder, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const q = `is:public fork:false archived:false ${search}`;

  const userRepos = await octokit.request("GET /search/repositories", {
    q,
    per_page: 10,
    sort: "updated",
  });

  return userRepos.data.items.map((repo) => ({
    id: repo.id.toString(),
    full_name: repo.full_name,
    active: activeRepos.includes(repo.id.toString()),
  }));
});
