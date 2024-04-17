import { z } from 'zod';
import { chatMessageSchema, chatSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const body = await z
    .object({
      repoId: z.number(),
    })
    .safeParseAsync(await readBody(event));

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid body',
    });
  }

  const repo = await requireAccessToRepo(user, body.data.repoId);

  const chat = await db
    .insert(chatSchema)
    .values({
      repoId: repo.id,
      userId: user.id,
      name: 'New Chat',
      createdAt: new Date(),
    })
    .returning()
    .get();

  await db.insert(chatMessageSchema).values({
    chatId: chat.id,
    from: 'ai',
    content: 'Hi there! How can I assist you?',
    createdAt: new Date(),
  });

  return chat;
});
