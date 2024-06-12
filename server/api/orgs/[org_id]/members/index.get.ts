import { eq } from 'drizzle-orm';
import { orgMemberSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const orgId = getRouterParam(event, 'org_id');
  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'org_id is required',
    });
  }

  const org = await requireAccessToOrg(user, parseInt(orgId, 10), 'admin');

  const members = await db.select().from(orgMemberSchema).where(eq(orgMemberSchema.orgId, org.id)).all();

  return members;
});
