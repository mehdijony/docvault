// apps/api/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Fetch public key from Keycloak's JWKS endpoint
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get('KEYCLOAK_URL')}/realms/${configService.get('KEYCLOAK_REALM')}/protocol/openid-connect/certs`,
      }),
      audience: configService.get('KEYCLOAK_CLIENT_ID'),
      issuer: `${configService.get('KEYCLOAK_URL')}/realms/${configService.get('KEYCLOAK_REALM')}`,
    });
  }

  async validate(payload: any) {
    // payload is the decoded JWT from Keycloak
    const keycloakId = payload.sub;

    const user = await this.usersService.findByKeycloakId(keycloakId);

    if (!user) {
      // Auto-provision user from JWT claims
      return this.usersService.createFromKeycloakToken(payload);
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
    };
  }
}