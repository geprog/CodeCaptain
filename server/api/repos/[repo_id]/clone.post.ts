import * as path from 'path';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { repoSchema } from '../../../schemas';
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

  const _repoId = event.context.params?.repo_id;
  if (!_repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }
  const repoId = parseInt(_repoId, 10);

  await requireAccessToRepo(user, repoId);

  const repo = await db.select().from(repoSchema).where(eq(repoSchema.id, repoId)).get();

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

  // TODO: paginate over all issues

  let page = 1;
  while (true) {
    const { items: issues, total } = await userForgeApi.getIssues(repo.remoteId.toString(), { page, perPage: 50 });
    for await (const issue of issues) {
      let issueString = `# issue "${issue.title}" (${issue.number})`;
      if (issue.labels.length !== 0) {
        issueString += `\n\nLabels: ` + issue.labels.join(', ');
      }
      if (issue.description !== '') {
        issueString += `\n\n${issue.description}`;
      }
      if (issue.comments.length !== 0) {
        issueString +=
          `\n\n## Comments:\n` +
          issue.comments.map((comment) => `- ${comment.author.login}: ${comment.body}`).join('\n');
      }
      await fs.writeFile(path.join(folder, 'issues', `${issue.number}.md`), issueString);
    }

    console.log('wrote', issues.length, 'issues');

    // TODO: check total
    if (issues.length < 50) {
      break;
    }
    page += 1;
  }

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
