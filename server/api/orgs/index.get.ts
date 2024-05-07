import { orgMemberSchema, orgSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const orgs = await db
    .select()
    .from(orgSchema)
    .innerJoin(orgMemberSchema, eq(orgMemberSchema.orgId, orgSchema.id))
    .where(eq(orgMemberSchema.userId, user.id))
    .all();

  return orgs.flatMap((r) => r.orgs);
});
