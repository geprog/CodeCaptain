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
  }

  const forgeId = parseInt(forgeIdFromParams, 10);
  const forge = await getUserForgeAPI(user, forgeId);

  const { repoId } = (await readBody(event)) as { repoId: string };

  const forgeRepo = await forge.getRepo(repoId);

  const repo = await db
    .insert(repoSchema)
    .values({
      name: forgeRepo.name,
      cloneUrl: forgeRepo.cloneUrl,
      remoteId: forgeRepo.id.toString(),
      url: forgeRepo.url,
      forgeId: forgeRepo.forgeId,
    })
    .onConflictDoUpdate({
      target: [repoSchema.forgeId, repoSchema.remoteId],
      set: {
        name: forgeRepo.name,
        cloneUrl: forgeRepo.cloneUrl,
        url: forgeRepo.url,
      },
    })
    .returning()
    .get();

  await db
    .insert(userReposSchema)
    .values({
      userId: user.id,
      repoId: repo.id,
    })
    .run();

  await $fetch(`/api/repos/${repoId}/clone`, {
    method: 'POST',
    body: {
      ...user,
    },
    headers: {
      // TODO: pass auth / session to clone
    },
  });

  return repo;
});
