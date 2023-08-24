import * as path from 'path';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { RepoFromDB, repoSchema, userReposSchema } from '../../../schemas';
import { eq } from 'drizzle-orm';

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

  const user = await getUserFromCookie(event);
  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
  }

  const repoId = event.context.params?.repo_id;
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const user = await readBody(event);
  console.log('🚀 ~ file: clone.post.ts:39 ~ defineEventHandler ~ user:', user);
  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
  }
  const userRrepoForUser = await db.select().from(userReposSchema).where(eq(userReposSchema.userId, user.id)).get();

  if (userRrepoForUser) {
    const hasAcess = userRrepoForUser.userId === user.id;
    if (!hasAcess) {
      throw new Error(`user :${user.name} does not have access to repo with id:${repoId}`);
    }
  } else {
    console.log('repo does not exist in the db.');
  }

  const repo = await db.select().from(repoSchema).where(eq(repoSchema.id, userRrepoForUser.repoId)).get();

  const folder = path.join(config.data_path, repo.remoteId.toString());

  // clone repo
  console.log('clone', repo.cloneUrl, path.join(folder, 'repo'));

  if (!(await dirExists(path.join(folder, 'repo')))) {
    let log = await simpleGit().clone(repo.cloneUrl, path.join(folder, 'repo'));
    console.log('cloned', log);
  } else {
    let log = await simpleGit(path.join(folder, 'repo')).pull();
    console.log('pulled', log);
  }

  // write issues
  if (!(await dirExists(path.join(folder, 'issues')))) {
    await fs.mkdir(path.join(folder, 'issues'), { recursive: true });
  } else {
    await fs.rm(path.join(folder, 'issues'), { recursive: true });
    await fs.mkdir(path.join(folder, 'issues'), { recursive: true });
  }

  const userForgeApi = await getUserForgeAPI(user, repo.forgeId);

  // const issuesPaginator = octokit.paginate.iterator('GET /repos/{owner}/{repo}/issues', {
  //   owner: repo.owner.login,
  //   repo: repo.name,
  // });

  // for await (const response of issuesPaginator) {
  //   const issues = response.data;
  //   for (const issue of issues) {
  //     if (typeof issue === 'string' || !issue) {
  //       continue;
  //     }

  //     // const pull_request = issue.pull_request?.diff_url;

  //     let issueString = `# issue "${issue.title}" (${issue.number})`;

  //     if (issue.labels.length !== 0) {
  //       issueString +=
  //         `\n\nLabels: ` +
  //         issue.labels
  //           .map((label, index) => (typeof label === 'string' ? label : `${label.name} (${label.description})`))
  //           .join(', ');
  //     }

  //     if (issue.body !== '') {
  //       issueString += `\n\n${issue.body}`;
  //     }

  //     if (issue.comments !== 0) {
  //       const comments = (await octokit.request(`GET ${issue.comments_url}`)).data;

  //       issueString +=
  //         `\n\n## Comments:\n` + comments.map((comment) => `- ${comment.user.login}: ${comment.body}`).join('\n');
  //     }

  //     await fs.writeFile(path.join(folder, 'issues', `${issue.number}.md`), issueString);
  //   }
  //   console.log('wrote ', response.data.length, ' issues');
  //   break;
  // }

  console.log('start indexing ...');
  const indexingResponse = await $fetch<{ error?: string }>(`${config.api.url}/index`, {
    method: 'POST',
    body: {
      repo_name: repoId,
    },
  });

  if (indexingResponse.error) {
    console.error(indexingResponse.error);
    throw createError({
      statusCode: 500,
      statusMessage: 'cannot index repo',
    });
  }

  return 'ok';
});
