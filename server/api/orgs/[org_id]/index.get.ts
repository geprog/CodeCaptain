export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const orgId = getRouterParam(event, 'org_id');
  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const org = await requireAccessToOrg(user, parseInt(orgId, 10));
  return org;
});
