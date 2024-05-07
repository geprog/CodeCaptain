export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const _repoId = getRouterParam(event, 'repo_id');
  if (!_repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }
  const repoId = parseInt(_repoId, 10);

  const repo = await requireAccessToRepo(user, repoId, 'admin');

  await deleteRepo(repo.id);

  return 'ok';
});
