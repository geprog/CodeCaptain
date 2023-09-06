import * as path from 'path';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { repoSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const _repoId = event.context.params?.repo_id;
  if (!_repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }
  const repoId = parseInt(_repoId, 10);

  const repo = await requireAccessToRepo(user, repoId);

  const config = useRuntimeConfig();
  const folder = path.join(config.data_path, repo.id.toString());

  await createDataFolder();

  const userForgeApi = await getUserForgeAPI(user, repo.forgeId);

  if (!(await dirExists(path.join(folder, 'repo')))) {
    const cloneCredentials = await userForgeApi.getCloneCredentials();
    const cloneUrl = repo.cloneUrl.replace(
      'https://',
      `https://${cloneCredentials.username}:${cloneCredentials.password}@`,
    );

    let log = await simpleGit().clone(cloneUrl, path.join(folder, 'repo'));
    console.log('cloned', log);
  } else {
    const cloneCredentials = await userForgeApi.getCloneCredentials();
    const cloneUrl = repo.cloneUrl.replace(
      'https://',
      `https://${cloneCredentials.username}:${cloneCredentials.password}@`,
    );

    await simpleGit(path.join(folder, 'repo')).removeRemote('origin');
    await simpleGit(path.join(folder, 'repo')).addRemote('origin', cloneUrl);

    let log = await simpleGit(path.join(folder, 'repo')).pull('origin', repo.defaultBranch);
    console.log('pulled', log);
  }

  // write issues
  if (!(await dirExists(path.join(folder, 'issues')))) {
    await fs.mkdir(path.join(folder, 'issues'), { recursive: true });
  } else {
    await fs.rm(path.join(folder, 'issues'), { recursive: true });
    await fs.mkdir(path.join(folder, 'issues'), { recursive: true });
  }

  let page = 1;
  const perPage = 50;
  const since = repo.lastFetch || undefined;
  console.log('fetching issues since', since, '...');
  while (true) {
    const { items: issues, total } = await userForgeApi.getIssues(repo.remoteId.toString(), {
      page,
      perPage,
      since,
    });
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

    if (issues.length < perPage || page * perPage >= total) {
      break;
    }
    page += 1;
  }

  console.log(`wrote ${page * perPage} issues`);

  await db
    .update(repoSchema)
    .set({
      lastFetch: new Date(),
    })
    .where(eq(repoSchema.id, repo.id))
    .run();

  console.log('start indexing ...');
  const indexingResponse = await $fetch<{ error?: string }>(`${config.ai.url}/index`, {
    method: 'POST',
    body: {
      repo_id: repo.id,
    },
  });

  if (indexingResponse.error) {
    console.error(indexingResponse.error);
    throw createError({
      statusCode: 500,
      statusMessage: 'cannot index repo',
    });
  }

  console.log('done indexing');

  return 'ok';
});
