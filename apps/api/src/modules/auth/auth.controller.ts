// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Get, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('login')
  @ApiOperation({ summary: 'Get Keycloak login URL' })
  getLoginUrl(@Query('redirectUri') redirectUri: string) {
    return { url: this.authService.getLoginUrl(redirectUri) };
  }

  @Public()
  @Post('callback')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange auth code for tokens' })
  async callback(@Body() body: { code: string; redirectUri: string }) {
    return this.authService.exchangeCode(body.code, body.redirectUri);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Body() body: { refreshToken: string }) {
    await this.authService.logout(body.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user info' })
  getCurrentUser(@CurrentUser() user: JwtUser) {
    return user;
  }
}