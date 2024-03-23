import path from 'node:path';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'node:fs';
import { repoSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import weaviate from 'weaviate-ts-client';
import { WeaviateStore } from '@langchain/weaviate';

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
  const repoPath = path.join(folder, 'repo');

  const stream = new ReadableStream({
    async start(controller) {
      const log = (...d: unknown[]) => {
        console.log('sync', ...d);
        controller.enqueue(...d.map((d) => (typeof d === 'string' ? d : JSON.stringify(d))));
      };

      try {
        await createDataFolder();

        const userForgeApi = await getUserForgeAPI(user, repo.forgeId);

        const forgeRepo = await userForgeApi.getRepo(repo.remoteId.toString());

        console.log({ forgeRepo });

        await db
          .update(repoSchema)
          .set({
            name: forgeRepo.name,
            url: forgeRepo.url,
            cloneUrl: forgeRepo.cloneUrl,
            defaultBranch: forgeRepo.defaultBranch,
            avatarUrl: forgeRepo.avatarUrl,
          })
          .where(eq(repoSchema.id, repo.id))
          .run();

        const cloneCredentials = await userForgeApi.getCloneCredentials();
        const cloneUrl = repo.cloneUrl.replace(
          'https://',
          `https://${cloneCredentials.username}:${cloneCredentials.password}@`,
        );

        if (!(await dirExists(repoPath))) {
          log('cloning repo ...');
          let cloneLogs = await simpleGit().clone(cloneUrl, repoPath);
          log('cloned repo', cloneLogs);
        } else {
          log('pulling changes ...');
          await simpleGit(repoPath).removeRemote('origin');
          await simpleGit(repoPath).addRemote('origin', cloneUrl);
          await simpleGit(repoPath).pull('origin', repo.defaultBranch);
          log('pulled latest changes');
        }

        // write issues
        if (!(await dirExists(path.join(folder, 'issues')))) {
          await fs.mkdir(path.join(folder, 'issues'), { recursive: true });
        } else {
          await fs.rm(path.join(folder, 'issues'), { recursive: true });
          await fs.mkdir(path.join(folder, 'issues'), { recursive: true });
        }

        // let page = 1;
        // const perPage = 50;
        // const since = repo.lastFetch || undefined;
        // log('fetching issues since', since, '...');
        // while (true) {
        //   const { items: issues, total } = await userForgeApi.getIssues(repo.remoteId.toString(), {
        //     page,
        //     perPage,
        //     since,
        //   });
        //   for await (const issue of issues) {
        //     let issueString = `# issue "${issue.title}" (${issue.number})`;
        //     if (issue.labels.length !== 0) {
        //       issueString += `\n\nLabels: ` + issue.labels.join(', ');
        //     }
        //     if (issue.description !== '') {
        //       issueString += `\n\n${issue.description}`;
        //     }
        //     if (issue.comments.length !== 0) {
        //       issueString +=
        //         `\n\n## Comments:\n` +
        //         issue.comments.map((comment) => `- ${comment.author.login}: ${comment.body}`).join('\n');
        //     }
        //     await fs.writeFile(path.join(folder, 'issues', `${issue.number}.md`), issueString);
        //   }

        //   if (issues.length < perPage || page * perPage >= total) {
        //     break;
        //   }
        //   page += 1;
        // }

        // log(`wrote ${page * perPage} issues`);

        log('start indexing ...');

        const loader = new DirectoryLoader(repoPath, {
          '.ts': (path) => new TextLoader(path),
        });
        const docs = await loader.load();

        log({ docs: docs.map((doc) => doc.metadata) });

        const javascriptSplitter = RecursiveCharacterTextSplitter.fromLanguage('js', {
          chunkSize: 2000,
          chunkOverlap: 200,
        });
        const texts = await javascriptSplitter.splitDocuments(docs);

        console.log({ texts: texts.map((text) => text.metadata) });

        const weaviateClient = weaviate.client({
          scheme: process.env.WEAVIATE_SCHEME || 'http',
          host: process.env.WEAVIATE_HOST || 'localhost:8080',
          // apiKey: new ApiKey(process.env.WEAVIATE_API_KEY || 'default'),
        });

        await WeaviateStore.fromDocuments(
          texts,
          new OpenAIEmbeddings({
            openAIApiKey: config.ai.token,
          }),
          {
            client: weaviateClient,
            indexName: `Repo${repoId}`,
          },
        );

        await db
          .update(repoSchema)
          .set({
            lastFetch: new Date(),
          })
          .where(eq(repoSchema.id, repo.id))
          .run();

        log('done indexing');
      } catch (e) {
        log('error', e);
        controller.error(e);
      }
      controller.close();
    },
  });

  setResponseHeader(event, 'Content-Type', 'text/html');
  setResponseHeader(event, 'Cache-Control', 'no-cache');
  setResponseHeader(event, 'Transfer-Encoding', 'chunked');

  return sendStream(event, stream);
});
