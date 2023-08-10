import type { H3Event } from 'h3';
import { Forge, Tokens, Credentials, ForgeUser } from './types';
import { Forge as DBForge } from '../schemas';
import { Gitlab as GitlabApi } from '@gitbeaker/rest';

export class Gitlab implements Forge {
  private host: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUrl = 'http://localhost:3000/api/auth/callback'; // TODO: allow to configure this redirect url

  constructor(forge: DBForge) {
    this.host = forge.host || 'gitlab.com';
    this.clientId = forge.clientId;
    this.clientSecret = forge.clientSecret;
  }

  public async getCloneCredentials(todo: unknown): Promise<Credentials> {
    return {
      username: 'oauth',
      password: 'todo-token',
    };
  }

  public getClient(token: string) {
    return new GitlabApi({
      host: `https://${this.host}`,
      oauthToken: token,
    });
  }

  public getOauthRedirectUrl({ state }: { state: string }): string {
    return `https://${this.host}/oauth/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUrl}&state=${state}`;
  }

  public async getUserInfo(token: string): Promise<ForgeUser> {
    const client = this.getClient(token);
    const gitlabUser = await client.Users.showCurrentUser();
    return {
      name: gitlabUser.name,
      avatarUrl: gitlabUser.avatar_url,
      email: gitlabUser.email,
      remoteUserId: gitlabUser.id.toString(),
    };
  }

  public async oauthCallback(event: H3Event): Promise<Tokens> {
    const { code } = getQuery(event);
    if (!code) {
      throw new Error('No code provided');
    }

    const response: any = await $fetch(`https://${this.host}/oauth/token`, {
      method: 'POST',
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUrl,
      },
      ignoreResponseError: true,
    });
    if (response.error) {
      console.error(response);
      throw new Error('Error getting access token');
    }

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  }

  public async refreshToken(refreshToken: string): Promise<Tokens> {
    const response: any = await $fetch(`https://${this.host}/oauth/token`, {
      method: 'POST',
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      ignoreResponseError: true,
    });
    if (response.error) {
      console.error(response);
      throw new Error('Error refreshing access token');
    }

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  }

  public async getRepos(token: string, search?: string) {
    const client = this.getClient(token);
    const repos = await client.Projects.all({ search, membership: true, perPage: 10 });
    return repos.map((repo) => ({
      id: repo.id.toString(),
      name: repo.name,
    }));
  }
}
