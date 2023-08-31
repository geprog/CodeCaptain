import { eq, or, inArray } from 'drizzle-orm';
import { forgeSchema, userForgesSchema } from '../../schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const userForges = await db.select().from(userForgesSchema).where(eq(userForgesSchema.userId, user.id)).all();
  const forges = await db
    .select()
    .from(forgeSchema)
    .where(
      or(
        inArray(
          forgeSchema.id,
          userForges.map((u) => u.id),
        ),
        eq(forgeSchema.owner, user.id),
      ),
    )
    .all();

  return forges.map((forge) => {
    const isConnected = userForges.some((userForge) => userForge.forgeId === forge.id);
    return { ...forge, isConnected };
  });
});
