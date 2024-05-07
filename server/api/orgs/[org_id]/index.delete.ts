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

  const org = await requireAccessToOrg(user, orgId);

  // TODO: delete org
  // TODO: delete org members
  // TODO: delete org repos, chats, etc

  // await deleteRepo(repo.id);

  return 'ok';
});
