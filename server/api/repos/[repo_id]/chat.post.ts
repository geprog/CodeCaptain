export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const repoId = getRouterParam(event, 'repo_id');
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const repo = await requireAccessToRepo(user, parseInt(repoId, 10));

  const body = await readBody(event);
  const message = body?.message;
  const chatId = body?.chat_id;
  if (!message || !chatId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'message and chat_id are required',
    });
  }

  const config = useRuntimeConfig();
  const chatResponse = await $fetch<{ error?: string; answer: string; source_documents: string[] }>(
    `${config.ai.url}/ask`,
    {
      method: 'POST',
      body: {
        repo_id: repo.id,
        chat_id: `${user.id}-${chatId}`,
        question: message,
      },
    },
  );

  if (chatResponse.error) {
    console.error(chatResponse.error);
    throw createError({
      statusCode: 500,
      statusMessage: 'chatbot error',
    });
  }

  return chatResponse;
});
