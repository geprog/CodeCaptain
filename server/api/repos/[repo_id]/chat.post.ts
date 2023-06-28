import { Octokit } from "octokit";
import * as path from "path";
import { promises as fs } from "fs";
// import * as shelljs from "shelljs";
import { execa } from "execa";

async function dirExists(path: string) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export default defineEventHandler(async (event) => {
  console.log("chat");

  // const token = getCookie(event, "gh_token");
  const token = getHeader(event, "gh_token");
  const octokit = new Octokit({ auth: token });
  const user = (await octokit.request("GET /user")).data;

  const repoId = event.context.params?.repo_id;
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: "repo_id is required",
    });
  }

  const repo = (
    await octokit.request("GET /repositories/:id", {
      id: repoId,
    })
  ).data;

  const folder = path.join("data", user.login, repo.id.toString());

  if (!(await dirExists(path.join(folder)))) {
    throw createError({
      statusCode: 400,
      statusMessage: "project has not been cloned yet",
    });
  }

  const message = (await readBody(event))?.message;

  console.log("ask", message);

  //   const log = shelljs.exec(`python ./question.py ${message}`);
  const log = await execa(`python ./question.py 'kiel-live' ${[message]}`);
  console.log("log", log);

  console.log(repoId, log);

  return log;
});
