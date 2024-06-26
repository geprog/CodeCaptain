import { OpenAIEmbeddings } from '@langchain/openai';
import weaviate from 'weaviate-ts-client';
import { WeaviateStore } from '@langchain/weaviate';

const indexName = 'Repos';

export async function getRepoVectorStoreFromDocs(repoId: number) {}

export async function getVectorStoreClient() {
  const config = useRuntimeConfig();

  return weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
    headers: {
      'X-OpenAI-Api-Key': config.ai.token,
    },
  });
}

export async function getRepoVectorStore(repoId: number) {
  const config = useRuntimeConfig();

  const client = await getVectorStoreClient();

  const exists = await client.schema.exists(indexName);
  if (!exists) {
    await client.schema
      .classCreator()
      .withClass({
        class: indexName,
        multiTenancyConfig: { enabled: true },
      })
      .do();
  }

  const tenants = await client.schema.tenantsGetter(indexName).do();
  if (!tenants.some((t) => t.name === `repo-${repoId}`)) {
    await client.schema.tenantsCreator(indexName, [{ name: `repo-${repoId}` }]).do();
  }

  return await WeaviateStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: config.ai.token,
    }),
    {
      client,
      indexName,
      tenant: `repo-${repoId}`,
      textKey: 'text',
      metadataKeys: ['source'],
    },
  );
}

export async function deleteRepoVectorStore(repoId: number) {
  const client = await getVectorStoreClient();

  const exists = await client.schema.exists(indexName);
  if (!exists) {
    return;
  }

  const tenants = await client.schema.tenantsGetter(indexName).do();
  if (!tenants.some((t) => t.name === `repo-${repoId}`)) {
    await client.schema.tenantsDeleter(indexName, [`repo-${repoId}`]).do();
  }

  // await client.data.deleter().withClassName(indexName).withTenant(`repo-${repoId}`).do();
}
