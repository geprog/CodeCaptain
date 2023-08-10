export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = getHeader(event, 'gh_token');

  // TODO: check user access to repo

  const repoId = event.context.params?.repo_id;
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const message = (await readBody(event))?.message;

  const chatResponse = await $fetch(`${config.api.url}/ask`, {
    method: 'POST',
    body: {
      repo_name: repoId,
      question: message,
    },
  });

  if (chatResponse.error) {
    console.error(chatResponse.error);
    throw createError({
      statusCode: 500,
      statusMessage: 'chatbot error',
    });
  }

  return chatResponse;
});
