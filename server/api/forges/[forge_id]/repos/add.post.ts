import { repoSchema, userReposSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const forgeIdFromParams = event.context.params?.forge_id;
  if (!forgeIdFromParams) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const forgeId = parseInt(forgeIdFromParams, 10);
  const forge = await getUserForgeAPI(user, forgeId);

  const { remoteRepoId } = (await readBody(event)) as { remoteRepoId?: string };
  if (!remoteRepoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'remoteRepoId is required',
    });
  }

  const forgeRepo = await forge.getRepo(remoteRepoId);

  const repo = await db
    .insert(repoSchema)
    .values({
      remoteId: forgeRepo.id.toString(),
      forgeId: forgeRepo.forgeId,
      name: forgeRepo.name,
      cloneUrl: forgeRepo.cloneUrl,
      url: forgeRepo.url,
      defaultBranch: forgeRepo.defaultBranch,
      avatarUrl: forgeRepo.avatarUrl,
    })
    .onConflictDoUpdate({
      target: [repoSchema.forgeId, repoSchema.remoteId],
      set: {
        name: forgeRepo.name,
        cloneUrl: forgeRepo.cloneUrl,
        url: forgeRepo.url,
        defaultBranch: forgeRepo.defaultBranch,
        avatarUrl: forgeRepo.avatarUrl,
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

  return repo;
});
