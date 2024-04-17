import { and, eq } from 'drizzle-orm';
import { chatMessageSchema, chatSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const chatId = getRouterParam(event, 'chat_id');
  if (!chatId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'chat_id is required',
    });
  }

  const chat = await db
    .select()
    .from(chatSchema)
    .where(and(eq(chatSchema.id, parseInt(chatId, 10)), eq(chatSchema.userId, user.id)))
    .get();

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found',
    });
  }

  const messages = await db.select().from(chatMessageSchema).where(eq(chatMessageSchema.chatId, chat.id)).all();

  return { ...chat, messages };
});
