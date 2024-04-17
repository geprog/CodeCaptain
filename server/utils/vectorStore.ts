import { OpenAIEmbeddings } from '@langchain/openai';
import { Chroma } from 'langchain/vectorstores/chroma';

export async function getRepoVectorStore(repoId: number) {
  const config = useRuntimeConfig();

  return await Chroma.fromExistingCollection(
    new OpenAIEmbeddings({
      openAIApiKey: config.ai.token,
    }),
    {
      collectionName: `repo-${repoId}`,
      url: config.ai.vectorDatabaseUrl,
      collectionMetadata: {
        'hnsw:space': 'cosine',
      },
    },
  );
}
