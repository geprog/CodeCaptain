import { eq } from 'drizzle-orm';
import { chatSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const chats = await db.select().from(chatSchema).where(eq(chatSchema.userId, user.id)).all();

  return chats;
});
