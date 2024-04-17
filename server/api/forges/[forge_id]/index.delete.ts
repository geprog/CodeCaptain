import { forgeSchema, repoSchema, userForgesSchema } from '~/server/schemas';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const _forgeId = event.context.params?.forge_id;
  if (!_forgeId) {
    throw createError({
      message: 'Cannot create forge with a forge_id',
      status: 400,
    });
  }
  const forgeId = parseInt(_forgeId, 10);

  await db.delete(userForgesSchema).where(eq(userForgesSchema.forgeId, forgeId)).run();

  await db
    .delete(forgeSchema)
    .where(and(eq(forgeSchema.owner, user.id), eq(forgeSchema.id, forgeId)))
    .returning()
    .get();

  const repos = await db.select().from(repoSchema).where(eq(repoSchema.forgeId, forgeId)).all();
  for await (const repo of repos) {
    await deleteRepo(repo.id);
  }

  return 'ok';
});
