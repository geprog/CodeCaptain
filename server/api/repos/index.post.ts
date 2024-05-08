import { z } from 'zod';
import { orgReposSchema, repoSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const { remoteRepoId, orgId, forgeId } = await readValidatedBody(
    event,
    z.object({
      forgeId: z.number(),
      remoteRepoId: z.string(),
      orgId: z.string(),
    }).parseAsync,
  );
  if (!remoteRepoId || !orgId || !forgeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'remoteRepoId is required',
    });
  }

  const forge = await getUserForgeAPI(user, forgeId);

  const org = await requireAccessToOrg(user, parseInt(orgId, 10), 'admin');

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
    .insert(orgReposSchema)
    .values({
      orgId: org.id,
      repoId: repo.id,
    })
    .run();

  return repo;
});
