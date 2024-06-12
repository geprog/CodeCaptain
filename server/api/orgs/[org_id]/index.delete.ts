import { eq } from 'drizzle-orm';
import { orgMemberSchema, orgSchema } from '~/server/schemas';

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

  const repos = await db.select().from(orgMemberSchema).where(eq(orgMemberSchema.orgId, org.id)).all();
  for await (const repo of repos) {
    await deleteRepo(repo.id);
  }

  await db.delete(orgSchema).where(eq(orgSchema.id, org.id)).run();
  await db.delete(orgMemberSchema).where(eq(orgMemberSchema.orgId, org.id)).run();

  return 'ok';
});
