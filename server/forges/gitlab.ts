import type { H3Event } from 'h3';
import { Forge, Tokens, UserInfo, Credentials } from './types';
import { Forge as DBForge } from '../schemas';
import { Gitlab as GitlabApi } from '@gitbeaker/rest';

export class Gitlab extends Forge {


  private host: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUrl = 'http://localhost:3000/api/auth/callback'; // TODO: allow to configure this redirect url

  constructor(forge: DBForge) {
    super();
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

  private getClient(token: string) {
    return new GitlabApi({
      host: `https://${this.host}`,
      oauthToken: token,
    });
  }

  public getOauthRedirectUrl({ state }: { state: string }): string {
    return `https://${this.host}/oauth/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUrl}&state=${state}`;
  }

  public async oauthCallback(
    event: H3Event,
  ): Promise<UserInfo> {
    
    const tokens = await this.getTokens(event);
    const token = (await tokens).accessToken;
    
    const client = this.getClient(token);

    const gitlabUser = await client.Users.showCurrentUser();

    return {
      name: gitlabUser.name || undefined,
      avatarUrl: gitlabUser.avatar_url || undefined,
      email: gitlabUser.email || undefined,
      remoteUserId: gitlabUser.id.toString(),
      tokens
    };
  }

  public async getTokens(event: H3Event): Promise<Tokens> {
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
      // to get token infomation  GET https://gitlab.example.com/oauth/token/info?access_token=<OAUTH-TOKEN>
      //TODO: set the expiration of tokens
      return {
        accessToken: response.access_token,
        refreshToken:response.refresh_token,
      };
  }

}
