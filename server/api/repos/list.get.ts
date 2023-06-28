import { Octokit } from "octokit";
import { readdir } from "fs/promises";
import * as path from "path";

export default defineEventHandler(async (event) => {
  console.log("cookie", event.req.headers);
  const token = getCookie(event, "gh_token");
  const octokit = new Octokit({ auth: token });

  const user = (await octokit.request("GET /user")).data;

  const dataFolder = path.join(process.env.DATA_FOLDER || "data", user.login);

  const activeRepos = (await readdir(dataFolder, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  return (await octokit.request("GET /user/repos")).data.map((repo) => ({
    id: repo.id,
    full_name: repo.full_name,
    active: activeRepos.includes(repo.id.toString()),
  }));
});
