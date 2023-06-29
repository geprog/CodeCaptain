import { Octokit } from "octokit";
import { promises as fs } from "fs";
import * as path from "path";

function dirExists(path: string) {
  return fs
    .stat(path)
    .then((stat) => stat.isDirectory())
    .catch(() => false);
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

  const userRepos = await octokit.request("GET /search/repositories", {
    q: `is:public fork:false archived:false "${search}" user:${user.login}`,
    per_page: 10,
    sort: "updated",
  });

  return userRepos.data.items.map((repo) => ({
    id: repo.id,
    full_name: repo.full_name,
    active: activeRepos.includes(repo.id.toString()),
  }));
});
