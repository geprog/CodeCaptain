import { Octokit } from "octokit";
import * as path from "path";
import { simpleGit } from "simple-git";
import { promises as fs } from "fs";
import * as shell from "shelljs";

export default defineEventHandler(async (event) => {
  console.log("clone");

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

  console.log(repo);

  const folder = path.join("data", user.login, repo.id.toString());

  console.log("clone", repo.clone_url, path.join(folder, "repo"));

  let log = await simpleGit().clone(repo.clone_url, path.join(folder, "repo"));
  console.log("cloned", log);

  await fs.writeFile(
    path.join(folder, "repo.json"),
    JSON.stringify(repo, null, 2)
  );

  const issuesPaginator = octokit.paginate.iterator(
    octokit.rest.issues.listForRepo,
    {
      owner: "octokit",
      repo: "rest.js",
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

      await fs.writeFile(
        path.join(folder, "issues", `${issue.id}.json`),
        `# ${title}\n\n${body}\n\n## Comments\n\n TODO`
      );
    }
  }

  log = shell.exec(
    `python ./indexer.py ${path.join(user.login, repo.id.toString())}`
  );
  console.log("indexed", log);

  console.log(repoId, folder);

  return "ok";
});
