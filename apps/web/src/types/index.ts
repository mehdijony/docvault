// ============================================================
// DocVault TypeScript Type Definitions
// Based on API Postman Collection v1.0.0
// ============================================================

// --- API Response Wrappers ---

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  errors: unknown[] | null;
}

// --- Pagination ---

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// --- Auth ---

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}

export interface CurrentUser {
  id: string;
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
}

export interface LoginUrlResponse {
  url: string;
}

// --- Users ---

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  lastLoginAt: string | null;
  avatarUrl?: string | null;
  keycloakId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  organization: {
    id: string;
    name: string;
    plan: string;
  };
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

// --- Organizations ---

export type OrgPlan = 'free' | 'pro' | 'enterprise';
export type OrgStatus = 'active' | 'inactive' | 'suspended';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  plan: OrgPlan;
  status: OrgStatus;
  keycloakRealmId: string;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  storageBucket: string;
  settings: {
    allowPublicSharing: boolean;
    requireMfa: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
}

// --- Documents ---

export type DocumentStatus = 'processing' | 'ready' | 'error' | 'deleted';

export interface Document {
  id: string;
  name: string;
  description: string | null;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  storagePath?: string;
  thumbnailPath: string | null;
  extractedText?: string | null;
  tags: string[];
  currentVersion: number;
  metadata: Record<string, unknown> | null;
  organizationId?: string;
  uploadedById?: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  folder?: {
    id: string;
    name: string;
  } | null;
  folderId?: string | null;
  versions?: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  storagePath: string;
  sizeBytes: number;
  changeNote: string;
  uploadedById: string;
  createdAt: string;
}

export interface UploadDocumentDto {
  file: File;
  name: string;
  description?: string;
  tags?: string[];
  folderId?: string;
}

export interface UpdateDocumentDto {
  name?: string;
  description?: string;
  tags?: string[];
  folderId?: string | null;
}

export interface DocumentListParams {
  page?: number;
  limit?: number;
  query?: string;
  folderId?: string;
  tags?: string;
}

export interface DownloadUrl {
  url: string;
  expiresIn: number;
}

// --- Sharing ---

export type SharePermission = 'view' | 'download' | 'edit';

export interface ShareLink {
  id: string;
  token: string;
  permission: SharePermission;
  isPublic: boolean;
  expiresAt: string;
  accessCount: number;
  maxAccessCount: number;
  documentId: string;
  createdById: string;
  createdAt: string;
  shareUrl: string;
}

export interface CreateShareDto {
  permission: SharePermission;
  expiresAt: string;
  isPublic: boolean;
  maxAccessCount?: number;
}

// --- Notifications ---

export type NotificationType =
  | 'document.shared'
  | 'document.updated'
  | 'document.uploaded'
  | 'document.deleted'
  | 'storage.quota_warning'
  | 'user.role_change'
  | 'user.invite';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  resourceId: string | null;
  resourceType: string | null;
  metadata: Record<string, unknown>;
  userId: string;
  organizationId: string;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

// --- Audit ---

export type AuditAction =
  | 'document.upload'
  | 'document.download'
  | 'document.view'
  | 'document.delete'
  | 'document.share'
  | 'document.update'
  | 'user.login'
  | 'user.logout'
  | 'user.invite'
  | 'user.role_change'
  | 'org.created'
  | 'org.settings_update';

export interface AuditLog {
  id: string;
  action: AuditAction;
  organizationId: string;
  userId: string;
  resourceId: string;
  resourceType: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  kafkaOffset?: string;
  createdAt: string;
}

export interface AuditListParams {
  page?: number;
  limit?: number;
}

// --- Shared Document (Public) ---

export interface SharedDocument {
  id: string;
  name: string;
  description: string | null;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  thumbnailPath: string | null;
  createdAt: string;
}
