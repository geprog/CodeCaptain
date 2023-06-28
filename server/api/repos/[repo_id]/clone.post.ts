import { Octokit } from "octokit";
import * as path from "path";
import { simpleGit } from "simple-git";
import { promises as fs } from "fs";

async function saveIssues() {
  const token = getCookie(event, 'gh_token');
  const octokit = new Octokit({ auth: token });

  const issuesPaginator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner: "octokit",
    repo: "rest.js",
  });

  for await (const response of issuesPaginator) {
    const issues = response.data;
    for (const issue of issues) {
      const title = issue.;
      const body = issue.body;
    }
  }
}

export default defineEventHandler(async (event) => {
  console.log("clone");

  const token = getCookie(event, 'gh_token');
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

  const folder = path.join(
    process.env.DATA_FOLDER || "data",
    user.login,
    repo.id.toString(),
    "repo"
  );

  console.log("clone", repo.clone_url, folder);

  const log = await simpleGit().clone(repo.clone_url, folder);
  console.log("cloned", log);

  await fs.writeFile(
    path.join(folder, "repo.json"),
    JSON.stringify(repo, null, 2)
  );

  // TODO: run indexing

  console.log(repoId, folder);

  return "ok";
});
