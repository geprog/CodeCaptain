import { repoSchema, userReposSchema } from "../../../schemas";
import { eq } from 'drizzle-orm';


export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const repoId = event.context.params?.repo_id;

  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const repo = await db.select().from(repoSchema).where(eq(repoSchema.id, Number(repoId))).get();

  const user = await getUserFromCookie(event);

  if(user){
    const repoForUser = await db.select().from(userReposSchema).where(eq(userReposSchema.repoId, Number(repoId))).get();
    const hasAcess = repoForUser && repoForUser.userId === user.id;
    if(!hasAcess){
      throw new Error(`user :${user.name} does not have access to repo with id:${repoId}`)
    }
  }else{
    throw new Error('user not found while trying to fetch repo');
  }


  const message = (await readBody(event))?.message;

  const chatResponse = await $fetch<{ error?: string }>(`${config.api.url}/ask`, {
    method: 'POST',
    body: {
      repo_name: repo.name,
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
