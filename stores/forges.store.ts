export const useForgesStore = async () => {
  const { data: forges, refresh: reloadForges } = await useFetch('/api/user/forges');

  return { forges, reloadForges };
};
