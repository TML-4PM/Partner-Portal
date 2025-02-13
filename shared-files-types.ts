export interface File {
  id: string;
  partnerId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  metadata?: {
    contentType?: string;
    lastModified?: string;
    dimensions?: {
      width?: number;
      height?: number;
    };
    tags?: string[];
  };
  permissions: {
    public: boolean;
    allowedUsers?: string[];
    allowedRoles?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadRequest {
  partnerId: string;
  file: File;
  metadata?: File['metadata'];
  permissions?: File['permissions'];
}

export interface FileUpdateRequest {
  id: string;
  partnerId: string;
  metadata?: Partial<File['metadata']>;
  permissions?: Partial<File['permissions']>;
}

export interface FileSearchParams {
  partnerId?: string;
  type?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  public?: boolean;
}

export interface FileOperationResponse {
  success: boolean;
  message: string;
  file?: File;
  error?: {
    code: string;
    details: string;
  };
}