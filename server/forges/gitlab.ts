import type { H3Event } from 'h3';
import { Forge } from './types';
import { Forge as DBForge } from '../schemas';
import { Gitlab as GitlabApi } from '@gitbeaker/rest';

export class Gitlab extends Forge {
  private id: number;
  private host: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUrl: string;

  constructor(forge: DBForge) {
    super();
    this.id = forge.id;
    this.host = forge.host || 'gitlab.com';
    this.clientId = forge.clientId;
    this.clientSecret = forge.clientSecret;
    this.redirectUrl = `http://localhost:3000/api/auth/callback`; // TODO: allow to configure this redirect url
  }

  public async getCloneCredentials(todo: unknown): Promise<{
    username: string;
    password: string;
  }> {
    return {
      username: 'oauth',
      password: 'todo-token',
    };
  }

  private getClient(token: string) {
    return new GitlabApi({
      host: `https://${this.host}`,
      oauthToken: token,
    });
  }

  public getOauthRedirectUrl(): string {
    return `https://${this.host}/oauth/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUrl}&state=${this.id}`;
  }

  public async oauthCallback(
    event: H3Event,
  ): Promise<{ name?: string; avatarUrl?: string; email?: string; remoteUserId: string }> {
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

    const token = response.access_token;
    const client = this.getClient(token);

    const gitlabUser = await client.Users.showCurrentUser();

    return {
      name: gitlabUser.name || undefined,
      avatarUrl: gitlabUser.avatar_url || undefined,
      email: gitlabUser.email || undefined,
      remoteUserId: gitlabUser.id.toString(),
    };
  }
}
