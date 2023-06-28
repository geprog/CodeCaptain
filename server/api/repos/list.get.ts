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
  console.log("cookie", event.req.headers);
  // const token = getCookie(event, "gh_token");
  const token = getHeader(event, "gh_token");
  const octokit = new Octokit({ auth: token });

  const user = (await octokit.request("GET /user")).data;

  const dataFolder = path.join("data", user.login);

  if (!(await dirExists(dataFolder))) {
    await fs.mkdir(dataFolder, { recursive: true });
  }

  const activeRepos = (await fs.readdir(dataFolder, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  return (await octokit.request("GET /user/repos")).data.map((repo) => ({
    id: repo.id,
    full_name: repo.full_name,
    active: activeRepos.includes(repo.id.toString()),
  }));
});
