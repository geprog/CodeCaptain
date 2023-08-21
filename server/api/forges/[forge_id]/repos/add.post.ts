import { repoSchema, userReposSchema } from '../../../../schemas';

export default defineEventHandler(async (event) => {
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


  const forgeIdFromParams = event.context.params?.forge_id;
  if (!forgeIdFromParams) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }  if (!forgeIdFromParams) {
    return;
  }
  const forgeId = parseInt(forgeIdFromParams,10)
  console.log("🚀 ~ file: add.post.ts:26 ~ defineEventHandler ~ forgeId:", forgeId)
  const forge = await getUserForgeAPI(user, forgeId);

  const repoId = await readBody(event) satisfies string;

  const forgeRepo = await forge.getRepo(repoId);

  const repo = await db
    .insert(repoSchema)
    .values({
      name: forgeRepo.name,
      cloneUrl: forgeRepo.cloneUrl,
      remoteId: forgeRepo.id,
      url: forgeRepo.url,
      forgeId: forgeRepo.forgeId,
    })
    .returning()
    .get();

  await db.insert(userReposSchema).values({
    userId: user.id,
    repoId: repo.id,
  });

  await $fetch(`/api/repos/${repoId}/clone`,{
    method: 'POST',
  })

  return repo;
});
