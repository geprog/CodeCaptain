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
  const config = useRuntimeConfig();
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

  const folder = path.join(config.data_path, user.login, repo.id.toString());

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

  await fs.writeFile(
    path.join(folder, "repo.json"),
    JSON.stringify(repo, null, 2)
  );

  if (!(await dirExists(path.join(folder, "issues")))) {
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

      const title = issue.title;
      const body = issue.body;
      const labels = issue.labels;

      const pull_request = issue.pull_request?.diff_url;

      const comments = (await octokit.request(`GET ${issue.comments_url}`))
        .data;

      const labs = labels.map(
        (label, index) =>
          `\n\nlabel ${index + 1} named ${label.name} has the description ${
            label.description
          }`
      );

      const coms = comments.map(
        (comment) => ` \n\nthe user ${comment.user.login} said: ${comment.body}`
      );

      let writeString = `In the github issue "${title}"`;

      if (!!body || body !== "") {
        writeString = writeString.concat(` the requirement is: ${body}\n\n`);
      }
      if (labs.length !== 0) {
        writeString = writeString.concat(
          `The issue has the following labels: ${labs} \n\n`
        );
      }
      if (!!coms || coms.length !== 0) {
        writeString = writeString.concat(
          `The issue has the following comments: ${coms}`
        );
      }

      await fs.writeFile(
        path.join(folder, "issues", `${issue.id}.txt`),
        writeString
      );
    }




    const repo_name = path.join(user.login, repo.id.toString());

    const config = useRuntimeConfig();
    const indexingResponse = await $fetch(`${config.api.url}/index`, {
      method: "POST",
      body: {
        repo_name: repo_name,
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
