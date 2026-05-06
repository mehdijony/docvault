// src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { keycloakId },
      relations: ['organization'],
    });
  }

  async findByEmail(email: string, organizationId: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email, organizationId },
    });
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.userRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async createFromKeycloakToken(payload: any): Promise<User> {
    // Extract organization from token claims
    // Keycloak can pass custom claims via mappers
    const organizationId =
      payload.organization_id ||
      payload['custom:organization_id'] ||
      'default-org-id'; // fallback for dev

    const user = this.userRepo.create({
      keycloakId: payload.sub,
      email: payload.email,
      firstName: payload.given_name || payload.name?.split(' ')[0] || 'User',
      lastName: payload.family_name || payload.name?.split(' ')[1] || '',
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
      organizationId,
    });

    return this.userRepo.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, { lastLoginAt: new Date() });
  }

  async updateRole(
    id: string,
    role: UserRole,
    organizationId: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id, organizationId },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    await this.userRepo.update(id, { role });
    return this.findById(id);
  }

  async updateStatus(
    id: string,
    status: UserStatus,
    organizationId: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id, organizationId },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    await this.userRepo.update(id, { status });
    return this.findById(id);
  }
}