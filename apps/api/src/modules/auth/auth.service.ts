// apps/api/src/modules/auth/auth.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private configService: ConfigService) {}

  // Exchange code for tokens via Keycloak
  async exchangeCode(code: string, redirectUri: string) {
    const keycloakUrl = this.configService.get('KEYCLOAK_URL');
    const realm = this.configService.get('KEYCLOAK_REALM');
    const clientId = this.configService.get('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET');

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const response = await axios.post(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const keycloakUrl = this.configService.get('KEYCLOAK_URL');
    const realm = this.configService.get('KEYCLOAK_REALM');
    const clientId = this.configService.get('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET');

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    const response = await axios.post(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return response.data;
  }

  async logout(refreshToken: string) {
    const keycloakUrl = this.configService.get('KEYCLOAK_URL');
    const realm = this.configService.get('KEYCLOAK_REALM');
    const clientId = this.configService.get('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET');

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    await axios.post(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
  }

  getLoginUrl(redirectUri: string): string {
    const keycloakUrl = this.configService.get('KEYCLOAK_URL');
    const realm = this.configService.get('KEYCLOAK_REALM');
    const clientId = this.configService.get('KEYCLOAK_CLIENT_ID');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
    });

    return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?${params}`;
  }
}