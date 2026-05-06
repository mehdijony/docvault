// src/modules/documents/documents.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
// ↓ Use "import type" to fix TS1272
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  UploadDocumentDto,
  UpdateDocumentDto,
  SearchDocumentsDto,
} from './dto/upload-document.dto';
import { SharePermission } from './entities/document-share.entity';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/webp',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Upload a document' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.uploadDocument(file, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  async findAll(
    @Query() dto: SearchDocumentsDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.findAll(user.organizationId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.findById(id, user.organizationId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get presigned download URL' })
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    const url = await this.documentsService.getDownloadUrl(id, user);
    return { url, expiresIn: 3600 };
  }

  @Patch(':id')
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Update document metadata' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.update(id, dto, user);
  }

  @Post(':id/share')
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Create share link' })
  async createShare(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    dto: {
      permission: SharePermission;
      expiresAt?: Date;
      maxAccessCount?: number;
      isPublic?: boolean;
    },
    @CurrentUser() user: JwtUser,
  ) {
    return this.documentsService.createShareLink(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Delete document' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    await this.documentsService.softDelete(id, user);
  }
}