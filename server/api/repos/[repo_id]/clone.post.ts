import { Octokit } from "octokit";
import * as path from "path";
import { simpleGit } from "simple-git";
import { promises as fs } from "fs";

async function dirExists(path: string) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = getHeader(event, "gh_token");
  const octokit = new Octokit({ auth: token });

  // TODO: check user access to repo

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

  const folder = path.join(config.data_path, repo.id.toString());

  // clone repo
  console.log("clone", repo.clone_url, path.join(folder, "repo"));

  if (!(await dirExists(path.join(folder, "repo")))) {
    let log = await simpleGit().clone(
      repo.clone_url,
      path.join(folder, "repo")
    );
    console.log("cloned", log);
  } else {
    let log = await simpleGit(path.join(folder, "repo")).pull();
    console.log("pulled", log);
  }

  // write repo.json
  await fs.writeFile(
    path.join(folder, "repo.json"),
    JSON.stringify(repo, null, 2)
  );
  console.log("wrote repo.json");

  // write issues
  if (!(await dirExists(path.join(folder, "issues")))) {
    await fs.mkdir(path.join(folder, "issues"), { recursive: true });
  } else {
    await fs.rm(path.join(folder, "issues"), { recursive: true });
    await fs.mkdir(path.join(folder, "issues"), { recursive: true });
  }

  const issuesPaginator = octokit.paginate.iterator(
    "GET /repos/{owner}/{repo}/issues",
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

      // const pull_request = issue.pull_request?.diff_url;

      let issueString = `# issue "${issue.title}" (${issue.number})`;

      if (issue.labels.length !== 0) {
        issueString +=
          `\n\nLabels: ` +
          issue.labels
            .map((label, index) =>
              typeof label === "string"
                ? label
                : `${label.name} (${label.description})`
            )
            .join(", ");
      }

      if (issue.body !== "") {
        issueString += `\n\n${issue.body}`;
      }

      if (issue.comments !== 0) {
        const comments = (await octokit.request(`GET ${issue.comments_url}`))
          .data;

        issueString +=
          `\n\n## Comments:\n` +
          comments
            .map((comment) => `- ${comment.user.login}: ${comment.body}`)
            .join("\n");
      }

      await fs.writeFile(
        path.join(folder, "issues", `${issue.number}.md`),
        issueString
      );
    }
    console.log("wrote ", response.data.length, " issues");
    break;
  }

  // start indexing
  console.log("start indexing ...");
  const indexingResponse = await $fetch(`${config.api.url}/index`, {
    method: "POST",
    body: {
      repo_name: repoId,
    },
  });

  if (indexingResponse.error) {
    console.error(indexingResponse.error);
    throw createError({
      statusCode: 500,
      statusMessage: "cannot index repo",
    });
  }

  return "ok";
});
