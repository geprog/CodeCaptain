export async function useForgesStore() {
  const { data: forges, refresh: reloadForges } = await useFetch('/api/user/forges');

  return { forges, reloadForges };
}
