import { repoSchema } from '../../../schemas';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const repoId = event.context.params?.repo_id;
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const repo = await db
    .select()
    .from(repoSchema)
    .where(eq(repoSchema.id, Number(repoId)))
    .get();

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

  await requireAccessToRepo(user, parseInt(repoId, 10));

  const message = (await readBody(event))?.message;

  const config = useRuntimeConfig();
  const chatResponse = await $fetch<{ error?: string }>(`${config.api.url}/ask`, {
    method: 'POST',
    body: {
      repo_name: repo.id,
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
