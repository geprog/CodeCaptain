import { eq } from 'drizzle-orm';
import { userSchema } from '../../schemas';

export default defineEventHandler(async (event) => {
  const idFromParam = event.context.params?.id;
  if (idFromParam) {
    const userId = idFromParam ? Number(idFromParam) : (await getUserFromCookie(event))?.id;
    if (userId) {
      const userInfo = db.select().from(userSchema).where(eq(userSchema.id, userId)).get();
      return userInfo;
    }
  }
});
