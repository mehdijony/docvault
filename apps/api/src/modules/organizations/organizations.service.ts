// src/modules/organizations/organizations.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationStatus } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
  ) {}

  async findById(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { slug } });
    if (!org) throw new NotFoundException(`Organization ${slug} not found`);
    return org;
  }

  async create(data: {
    name: string;
    slug: string;
    keycloakRealmId: string;
    storageBucket: string;
  }): Promise<Organization> {
    const existing = await this.orgRepo.findOne({
      where: { slug: data.slug },
    });
    if (existing) throw new ConflictException('Organization slug already exists');

    const org = this.orgRepo.create(data);
    return this.orgRepo.save(org);
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    await this.orgRepo.update(id, data);
    return this.findById(id);
  }

  async updateStorageUsed(id: string, byteDelta: number): Promise<void> {
    await this.orgRepo
      .createQueryBuilder()
      .update()
      .set({
        storageUsedBytes: () => `"storageUsedBytes" + ${byteDelta}`,
      })
      .where('id = :id', { id })
      .execute();
  }
}