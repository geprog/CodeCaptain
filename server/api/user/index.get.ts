export default defineEventHandler(async (event) => {
  return await getUser(event);
});
