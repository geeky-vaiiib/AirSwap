/**
 * File Storage Service
 * 
 * Handles file uploads to IPFS (nft.storage) with fallback stub for local development
 */

export interface UploadResult {
  cid: string;
  url: string;
  size: number;
  name: string;
  mimeType: string;
}

export interface FileUpload {
  buffer: Buffer;
  name: string;
  mimeType: string;
}

/**
 * Check if IPFS is configured
 */
function isIPFSConfigured(): boolean {
  return !!process.env.NFT_STORAGE_API_KEY;
}

/**
 * Upload file to IPFS via nft.storage
 */
async function uploadToIPFS(file: FileUpload): Promise<UploadResult> {
  const apiKey = process.env.NFT_STORAGE_API_KEY;
  
  if (!apiKey) {
    throw new Error('NFT_STORAGE_API_KEY not configured');
  }

  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimeType });
    formData.append('file', blob, file.name);

    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NFT.Storage upload failed: ${error}`);
    }

    const data = await response.json();
    const cid = data.value.cid;

    return {
      cid,
      url: `https://nftstorage.link/ipfs/${cid}`,
      size: file.buffer.length,
      name: file.name,
      mimeType: file.mimeType,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload file to local stub (for development without IPFS)
 * Generates a fake CID and stores file metadata
 */
async function uploadToStub(file: FileUpload): Promise<UploadResult> {
  // Generate deterministic "CID" from file hash
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const fakeCID = `bafybei${hash.substring(0, 52)}`; // CIDv1 format-ish

  console.warn(
    `[FILE STORAGE STUB] File "${file.name}" would be uploaded to IPFS. ` +
    `Using stub CID: ${fakeCID}. Configure NFT_STORAGE_API_KEY for real uploads.`
  );

  return {
    cid: fakeCID,
    url: `https://nftstorage.link/ipfs/${fakeCID}`,
    size: file.buffer.length,
    name: file.name,
    mimeType: file.mimeType,
  };
}

/**
 * Upload a single file to storage (IPFS or stub)
 */
export async function uploadFile(file: FileUpload): Promise<UploadResult> {
  // Validate file
  if (!file.buffer || file.buffer.length === 0) {
    throw new Error('File buffer is empty');
  }

  if (!file.name) {
    throw new Error('File name is required');
  }

  // Check file size (max 20MB)
  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.buffer.length > MAX_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_SIZE / 1024 / 1024}MB`);
  }

  // Upload to IPFS or stub
  if (isIPFSConfigured()) {
    return uploadToIPFS(file);
  } else {
    return uploadToStub(file);
  }
}

/**
 * Upload multiple files to storage
 */
export async function uploadFiles(files: FileUpload[]): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    try {
      const result = await uploadFile(file);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(allowed => {
    if (allowed.endsWith('/*')) {
      const prefix = allowed.slice(0, -2);
      return mimeType.startsWith(prefix);
    }
    return mimeType === allowed;
  });
}

/**
 * Allowed MIME types for claim evidence
 */
export const ALLOWED_EVIDENCE_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/**
 * Parse file from multipart form data or base64
 */
export function parseFileFromRequest(
  fileData: any,
  fileName: string,
  mimeType: string
): FileUpload {
  let buffer: Buffer;

  if (Buffer.isBuffer(fileData)) {
    buffer = fileData;
  } else if (typeof fileData === 'string') {
    // Assume base64 encoded
    buffer = Buffer.from(fileData, 'base64');
  } else if (fileData.data && Buffer.isBuffer(fileData.data)) {
    buffer = fileData.data;
  } else {
    throw new Error('Invalid file data format');
  }

  return {
    buffer,
    name: fileName,
    mimeType,
  };
}
