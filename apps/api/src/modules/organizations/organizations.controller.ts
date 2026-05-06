// src/modules/organizations/organizations.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('organizations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current organization' })
  async getMyOrg(@CurrentUser() user: JwtUser) {
    return this.orgsService.findById(user.organizationId);
  }

  @Patch('me')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Update organization settings' })
  async updateMyOrg(
    @CurrentUser() user: JwtUser,
    @Body() data: { name?: string; description?: string },
  ) {
    return this.orgsService.update(user.organizationId, data);
  }
}