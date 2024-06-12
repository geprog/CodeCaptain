import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { orgSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const _orgId = getRouterParam(event, 'org_id');
  if (!_orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'org_id is required',
    });
  }
  const orgId = parseInt(_orgId, 10);

  const org = await requireAccessToOrg(user, orgId, 'admin');

  const orgData = await readValidatedBody(
    event,
    z.object({ name: z.string().min(3), openAIToken: z.string() }).parseAsync,
  );

  const updatedOrg = await db
    .update(orgSchema)
    .set({ name: orgData.name, openAIToken: orgData.openAIToken })
    .where(eq(orgSchema.id, org.id))
    .returning()
    .get();

  return updatedOrg;
});
