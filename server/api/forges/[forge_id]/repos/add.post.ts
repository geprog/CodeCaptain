import type { H3Event } from 'h3';
import { repoSchema, userReposSchema } from '../../../../schemas';

export async function getSessionHeader(event: H3Event) {
  const config = useRuntimeConfig();

  console.log(getHeaders(event));

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

  return { [sessionName]: sealedSession };
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const forgeIdFromParams = event.context.params?.forge_id;
  if (!forgeIdFromParams) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const forgeId = parseInt(forgeIdFromParams, 10);
  const forge = await getUserForgeAPI(user, forgeId);

  const { repoId } = (await readBody(event)) as { repoId: string };

  const forgeRepo = await forge.getRepo(repoId);

  const repo = await db
    .insert(repoSchema)
    .values({
      name: forgeRepo.name,
      cloneUrl: forgeRepo.cloneUrl,
      remoteId: forgeRepo.id.toString(),
      url: forgeRepo.url,
      forgeId: forgeRepo.forgeId,
    })
    .onConflictDoUpdate({
      target: [repoSchema.forgeId, repoSchema.remoteId],
      set: {
        name: forgeRepo.name,
        cloneUrl: forgeRepo.cloneUrl,
        url: forgeRepo.url,
      },
    })
    .returning()
    .get();

  await db
    .insert(userReposSchema)
    .values({
      userId: user.id,
      repoId: repo.id,
    })
    .run();

  const sessionHeader = await getSessionHeader(event);

  await $fetch(`/api/repos/${repoId}/clone`, {
    method: 'POST',
    headers: {
      // forward session header
      ...sessionHeader,
    },
  });

  return repo;
});
