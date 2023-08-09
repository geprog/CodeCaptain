import { forgeSchema, userForgesSchema, userSchema } from '../../schemas';
import { and, eq } from 'drizzle-orm';
import { getForgeFromDB } from '../../forges';

export default defineEventHandler(async (event) => {
  const authenticatedUser = await getUserFromCookie(event);

  const { state } = getQuery(event);
  if (!state) {
    throw new Error('State is undefined');
  }

  const session = await useStorage().getItem<{ loginToForgeId: number }>(`oauth:${state}`);
  if (!session) {
    throw new Error('Session not found');
  }

  const forgeId = session.loginToForgeId;

  const forgeModel = await db.select().from(forgeSchema).where(eq(forgeSchema.id, forgeId)).get();
  if (!forgeModel) {
    throw new Error(`Forge with id ${forgeId} not found`);
  }

  const forge = getForgeFromDB(forgeModel);
  const oauthUser = await forge.oauthCallback(event);

  // authenticated user => update user & login
  if (authenticatedUser) {
    const user = await db
      .update(userSchema)
      .set({
        avatarUrl: oauthUser.avatarUrl,
        name: oauthUser.name,
        email: oauthUser.email,
      })
      .where(eq(userSchema.id, authenticatedUser.id))
      .returning()
      .get();

    // connect user to forge and ignore if already connected
    await db
      .insert(userForgesSchema)
      .values({
        userId: authenticatedUser.id,
        forgeId: forgeModel.id,
        remoteUserId: oauthUser.remoteUserId,
      })
      .onConflictDoNothing()
      .run();

    return setUserCookie(event, user);
  }

  if (!forgeModel.allowLogin) {
    throw new Error('Login not allowed for this forge');
  }

  // try to find user by its remoteUserId
  const userForge = await db
    .select()
    .from(userForgesSchema)
    .where(and(eq(userForgesSchema.forgeId, forgeModel.id), eq(userForgesSchema.remoteUserId, oauthUser.remoteUserId)))
    .get();

  // existing user => update user and login
  if (userForge) {
    const user = await db
      .update(userSchema)
      .set({
        avatarUrl: oauthUser.avatarUrl,
        name: oauthUser.name,
        email: oauthUser.email,
      })
      .where(eq(userSchema.id, userForge.userId))
      .returning()
      .get();

    return setUserCookie(event, user);
  }

  // completely new user => create user and userForge and login
  const user = await db
    .insert(userSchema)
    .values({
      avatarUrl: oauthUser.avatarUrl,
      name: oauthUser.name,
      email: oauthUser.email,
    })
    .returning()
    .get();

  await db
    .insert(userForgesSchema)
    .values({
      userId: user.id,
      forgeId: forgeModel.id,
      remoteUserId: oauthUser.remoteUserId,
    })
    .run();

  return setUserCookie(event, user);
});
