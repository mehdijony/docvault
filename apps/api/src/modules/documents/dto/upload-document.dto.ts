// apps/api/src/modules/documents/dto/upload-document.dto.ts
import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Document display name' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateDocumentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class SearchDocumentsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ default: 1 })
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  limit?: number = 20;
}