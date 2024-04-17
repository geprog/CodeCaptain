import {
  chatMessageSchema,
  chatSchema,
  forgeSchema,
  repoSchema,
  userForgesSchema,
  userReposSchema,
} from '~/server/schemas';
import { eq, and, inArray } from 'drizzle-orm';

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
  await db
    .delete(userReposSchema)
    .where(
      inArray(
        userReposSchema.repoId,
        repos.map((r) => r.id),
      ),
    )
    .run();
  await db
    .delete(repoSchema)
    .where(
      inArray(
        repoSchema.id,
        repos.map((r) => r.id),
      ),
    )
    .run();
  const chats = await db
    .select()
    .from(chatSchema)
    .where(
      inArray(
        chatSchema.repoId,
        repos.map((r) => r.id),
      ),
    )
    .all();
  await db
    .delete(chatSchema)
    .where(
      inArray(
        chatSchema.repoId,
        repos.map((r) => r.id),
      ),
    )
    .run();
  await db
    .delete(chatMessageSchema)
    .where(
      inArray(
        chatMessageSchema.chatId,
        chats.map((c) => c.id),
      ),
    )
    .run();

  // TODO: delete all repo vector stores

  return 'ok';
});
