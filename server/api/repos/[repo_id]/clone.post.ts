import { Octokit } from "octokit";
import * as path from "path";
import { simpleGit } from "simple-git";
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
  console.log("clone");

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

  console.log("clone", repo.clone_url, path.join(folder, "repo"));

  let log = await simpleGit().clone(repo.clone_url, path.join(folder, "repo"));
  console.log("cloned", log);

  await fs.writeFile(
    path.join(folder, "repo.json"),
    JSON.stringify(repo, null, 2)
  );

  if (!(await dirExists(path.join(folder, "issues")))) {
    await fs.mkdir(path.join(folder, "issues"), { recursive: true });
  }

const issuesPaginator = octokit.paginate.iterator(
  'GET /repos/{owner}/{repo}/issues',
  {
    owner: repo.owner.login,
    repo: repo.name,
  }
);

  for await (const response of issuesPaginator) {
    const issues = response.data;
    for (const issue of issues) {
      if (typeof issue === "string" || !issue) {
        continue;
      }

      const title = issue.title;
      const body = issue.body;
      const labels = issue.labels;
      const comments = issue.comments_url;

      await fs.writeFile(
        path.join(folder, "issues", `${issue.id}.json`),
        `The issue ${title}\n\n with the following description ${body}\n\n and has labels: ${labels} \n\n with comments ${comments }`
      );
    }
  }

  const cmd = `. env/bin/activate && python ./indexer.py ${path.join(
    user.login,
    repo.id.toString()
  )}`;
  console.log("cmd", cmd);
  const { stdout, stderr, exitCode } = await execa(cmd, {
    shell: true,
  });
  console.log("log", { stdout, stderr, exitCode });

  return "ok";
});
