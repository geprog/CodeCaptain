export async function useChatsStore() {
  const { data: chats, refresh } = await useFetch('/api/chats', {
    default: () => [],
  });

  return { chats, refresh };
}
