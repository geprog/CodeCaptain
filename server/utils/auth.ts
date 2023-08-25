import type { H3Event, SessionConfig } from 'h3';
import { User, forgeSchema, repoSchema, userForgesSchema, userReposSchema, userSchema } from '../schemas';
import { and, eq } from 'drizzle-orm';
import { getForgeFromDB, ForgeApi } from '../forges';

const sessionConfig: SessionConfig = useRuntimeConfig().auth || {};

export type AuthSession = {
  userId: number;
};

export async function useAuthSession(event: H3Event) {
  const session = await useSession<AuthSession>(event, sessionConfig);
  return session;
}

export async function getUser(event: H3Event): Promise<User | undefined> {
  const session = await useAuthSession(event);
  if (!session.data?.userId) {
    return undefined;
  }

  return await db.select().from(userSchema).where(eq(userSchema.id, session.data.userId)).get();
}

export async function requireUser(event: H3Event): Promise<User> {
  const user = await getUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  return user;
}

export async function getUserForgeAPI(user: User, forgeId: number) {
  const userForge = await db
    .select()
    .from(userForgesSchema)
    .where(and(eq(userForgesSchema.userId, user.id), eq(userForgesSchema.forgeId, forgeId)))
    .get();
  if (!userForge) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access to forge denied',
    });
  }

  const forgeModel = await db.select().from(forgeSchema).where(eq(forgeSchema.id, forgeId)).get();
  if (!forgeModel) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Forge not found',
    });
  }

  const tokens = {
    accessToken: userForge.accessToken,
    refreshToken: userForge.refreshToken,
    accessTokenExpiresIn: userForge.accessTokenExpiresIn,
  };

  const forge = getForgeFromDB(forgeModel);
  return new ForgeApi({ ...user, tokens }, forge);
}

export async function requireAccessToRepo(user: User, repoId: number) {
  const userRepo = await db
    .select()
    .from(userReposSchema)
    .where(and(eq(userReposSchema.userId, user.id), eq(userReposSchema.repoId, repoId)))
    .get();

  if (!userRepo) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access to repo denied',
    });
  }

  const repo = await db
    .select()
    .from(repoSchema)
    .where(eq(repoSchema.id, Number(repoId)))
    .get();

  if (!repo) {
    throw createError({
      statusCode: 404,
      message: 'Repo not found',
    });
  }

  return repo;
}

export async function getSessionHeader(event: H3Event) {
  const config = useRuntimeConfig();

  const sessionName = config.auth.name || 'h3';

  let sealedSession: string | undefined;

  // Try header first
  if (config.sessionHeader !== false) {
    const headerName =
      typeof config.sessionHeader === 'string'
        ? config.sessionHeader.toLowerCase()
        : `x-${sessionName.toLowerCase()}-session`;
    const headerValue = event.node.req.headers[headerName];
    if (typeof headerValue === 'string') {
      sealedSession = headerValue;
    }
  }

  // Fallback to cookies
  if (!sealedSession) {
    sealedSession = getCookie(event, sessionName);
  }

  if (!sealedSession) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  return { [`x-${sessionName.toLowerCase()}-session`]: sealedSession };
}
