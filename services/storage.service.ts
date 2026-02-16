import { apiStorage } from '@/lib/apiGraphql';

// =============================================================================
// Storage Service - Upload files ke Hasura/Nhost Storage
// =============================================================================

interface StorageFileInfo {
  id: string;
  name: string;
  size: number;
  bucketId: string;
  etag: string;
  createdAt: string;
  updatedAt: string;
  isUploaded: boolean;
  mimeType: string;
}

interface StorageUploadResponse {
  success: boolean;
  code: number;
  data: StorageFileInfo[];
}

export class StorageService {
  /**
   * Upload file ke storage
   * @param file - File object dari input
   * @param bucketId - Bucket ID (default: 'nhost')
   * @returns URL publik file yang diupload
   */
  static async uploadFile(file: File, bucketId = 'nhost'): Promise<string> {
    const formData = new FormData();
    formData.append('files[]', file);

    // Upload ke /files endpoint — jangan set Content-Type manual,
    // biarkan axios/browser set boundary otomatis
    const response = await apiStorage.post<StorageUploadResponse>('/files', formData, {
      params: {
        bucket_id: bucketId,
      },
    });

    const uploaded = response.data?.data?.[0];
    if (!uploaded?.id) {
      throw new Error('Upload gagal: tidak ada file yang diproses');
    }

    // Return public URL: /files/{fileId}
    return `/files/${uploaded.id}`;
  }

  /**
   * Get full public URL for a storage file path
   * @param filePath - Path dari storage (e.g. "/files/abc-123")
   * @returns Full URL
   */
  static getPublicUrl(filePath: string | null | undefined): string | null {
    if (!filePath) return null;

    // Jika sudah full URL, return langsung
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_STORAGE || 'https://storage.sitama.tabligh.id';
    // Pastikan tidak ada double slash
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${baseUrl}${cleanPath}`;
  }
}
