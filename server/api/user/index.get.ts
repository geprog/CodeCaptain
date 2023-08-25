export default defineEventHandler(async (event) => {
  return await requireUser(event);
});
