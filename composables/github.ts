// TODO: remove

export const useGithubCookie = () => useCookie('gh_token');

export const githubFetch = (url: string, fetchOptions: any = {}) => {
  return $fetch(url, {
    baseURL: 'https://api.github.com',
    ...fetchOptions,
    headers: {
      Authorization: `token ${useGithubCookie().value}`,
      ...fetchOptions.headers,
    },
  });
};

export const fetchGithubUser = async () => {
  const cookie = useGithubCookie();
  const user = useState('gh_user');
  if (cookie.value && !user.value) {
    user.value = await githubFetch('/user');
  }
  return user;
};
