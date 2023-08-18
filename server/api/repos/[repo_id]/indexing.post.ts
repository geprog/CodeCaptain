export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const repoId = event.context.params?.repo_id;
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  console.log('start indexing ...');
  const indexingResponse = await $fetch(`${config.api.url}/index`, {
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
});
