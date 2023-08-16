import { repoSchema, userReposSchema } from '../../../../schemas';
import { eq, inArray } from 'drizzle-orm';

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

  const forgeId = 1; // TODO:
  const forge = await getUserForgeAPI(user, forgeId);

  const repoId = '1'; // TODO

  const forgeRepo = await forge.getRepo(repoId);

  const repo = await db
    .insert(repoSchema)
    .values({
      name: forgeRepo.name,
      cloneUrl: forgeRepo.cloneUrl,
      remoteId: forgeRepo.id,
      forgeId,
      url: forgeRepo.url,
    })
    .returning()
    .get();

  await db.insert(userReposSchema).values({
    userId: user.id,
    repoId: repo.id,
  });

  return repo;
});
