import type { H3Event } from 'h3';
import { User, forgeSchema, userForgesSchema, userSchema } from '../../schemas';
import { and, eq } from 'drizzle-orm';
import { getForgeFromDB } from '../../forges';

function setUserCookie(event: H3Event, user: User) {
  // TODO: set cookie using jwt-token etc instead of plain token
  setCookie(
    event,
    'token',
    JSON.stringify({
      userId: user.id,
    }),
    { path: '/' },
  );

  return sendRedirect(event, '/');
}

export default defineEventHandler(async (event) => {
  const userToken = getCookie(event, 'token');
  const authenticatedUser = userToken ? (JSON.parse(userToken) as { userId: number }) : undefined; // TODO: use jwt token instead of plain token

  // TODO: get correct forge
  const forgeId = 1;
  const forgeModel = await db.select().from(forgeSchema).where(eq(forgeSchema.id, forgeId)).get();
  if (!forgeModel) {
    throw new Error(`Forge with id ${forgeId} not found`);
  }

  const forge = await getForgeFromDB(forgeModel);

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
      .where(eq(userSchema.id, authenticatedUser.userId))
      .returning()
      .get();

    // connect user to forge and ignore if already connected
    await db
      .insert(userForgesSchema)
      .values({
        userId: authenticatedUser.userId,
        forgeId: forgeModel.id,
        remoteUserId: oauthUser.remoteUserId,
      })
      .onConflictDoNothing()
      .run();

    return setUserCookie(event, user);
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
