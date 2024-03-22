import * as path from 'path';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { repoSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { OpenAIEmbeddings } from '@langchain/openai';

async function syncAndIndex(stream: Stream) {}

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

  const repoPath = path.join(folder, 'repo');

  const stream = new ReadableStream({
    async start(controller) {
      const log = (...d: unknown[]) => {
        console.log('sync', ...d);
        controller.enqueue(...d);
      };

      try {
        if (!(await dirExists(repoPath))) {
          log('cloning ...');
          const cloneCredentials = await userForgeApi.getCloneCredentials();
          const cloneUrl = repo.cloneUrl.replace(
            'https://',
            `https://${cloneCredentials.username}:${cloneCredentials.password}@`,
          );

          let cloneLogs = await simpleGit().clone(cloneUrl, repoPath);
          log('cloned', cloneLogs);
        } else {
          log('pulling ...');
          const cloneCredentials = await userForgeApi.getCloneCredentials();
          const cloneUrl = repo.cloneUrl.replace(
            'https://',
            `https://${cloneCredentials.username}:${cloneCredentials.password}@`,
          );

          await simpleGit(repoPath).removeRemote('origin');
          await simpleGit(repoPath).addRemote('origin', cloneUrl);

          let pullLogs = await simpleGit(repoPath).pull('origin', repo.defaultBranch);
          log('pulled', pullLogs);
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

        const vectorStore = await FaissStore.fromDocuments(
          texts,
          new OpenAIEmbeddings({
            openAIApiKey: config.ai.token,
          }),
        );

        vectorStore.save(path.join(folder, 'vectorstore'));

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
      }
      controller.close();
    },
  });

  setResponseHeader(event, 'Content-Type', 'text/html');
  setResponseHeader(event, 'Cache-Control', 'no-cache');
  setResponseHeader(event, 'Transfer-Encoding', 'chunked');

  return sendStream(event, stream);
});
