import { Octokit } from "octokit";
import * as path from "path";
import { promises as fs } from "fs";
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

  const folder = path.join("data", user.login, repoId);

  if (!(await dirExists(path.join(folder)))) {
    throw createError({
      statusCode: 400,
      statusMessage: "project has not been cloned yet",
    });
  }

  const message = (await readBody(event))?.message;

  console.log("ask", message);

  const cmd = `. env/bin/activate && python ./question.py "${path.join(
    user.login,
    repoId
  )}" "${message}"`;
  console.log("cmd", cmd);
  const { stdout, stderr, exitCode } = await execa(cmd, {
    shell: true,
  });
  console.log("log", { stdout, stderr, exitCode });

  if (stdout.includes("<<<")) {
    return stdout.substring(
      stdout.indexOf(">>>") + ">>>".length,
      stdout.indexOf("<<<")
    );
  }

  return stdout;
});
