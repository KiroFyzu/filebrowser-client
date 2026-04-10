import { readFile } from 'node:fs/promises';

import { Authenticator } from '../core/authenticator.js';
import { FileBrowserError, UploadError, ValidationError } from '../core/errors.js';
import { HttpClient } from '../core/http-client.js';
import type { UploadOptions, UploadResult, UploadSource } from '../types/index.js';
import { buildPublicUrl, buildTusPath, extractFileName } from '../utils/path.js';

interface UploadPayload {
  fileName: string;
  content: Buffer;
}

/**
 * Handles file upload flow using File Browser TUS endpoints.
 */
export class UploadApi {
  private readonly httpClient: HttpClient;
  private readonly authenticator: Authenticator;
  private readonly baseUrl: string;

  /**
   * Creates an UploadApi instance.
   * @param httpClient - Shared HttpClient.
   * @param authenticator - Shared Authenticator.
   * @param baseUrl - Normalized File Browser base URL.
   */
  constructor(httpClient: HttpClient, authenticator: Authenticator, baseUrl: string) {
    this.httpClient = httpClient;
    this.authenticator = authenticator;
    this.baseUrl = baseUrl;
  }

  /**
   * Uploads a file from local path or in-memory data.
   * @param source - Local file path or in-memory bytes.
   * @param options - Upload options.
   * @returns Upload result payload.
   */
  async upload(source: UploadSource, options: UploadOptions = {}): Promise<UploadResult> {
    const remotePath = options.remotePath ?? '/';
    const override = options.override ?? false;
    const payload = await this.resolvePayload(source, options.fileName);

    return this.withAuth(async (token) => {
      const tusPath = buildTusPath(remotePath, payload.fileName, override);

      await this.httpClient.requestVoid('POST', tusPath, {
        token,
        headers: {
          'Tus-Resumable': '1.0.0',
          'Upload-Length': payload.content.length.toString()
        }
      });

      await this.httpClient.requestVoid('PATCH', tusPath, {
        token,
        headers: {
          'Content-Type': 'application/offset+octet-stream',
          'Tus-Resumable': '1.0.0',
          'Upload-Offset': '0'
        },
        body: payload.content as unknown as BodyInit
      });

      const normalizedPath = remotePath.startsWith('/') ? remotePath : `/${remotePath}`;
      const finalDirectory = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
      const finalPath = `${finalDirectory}${payload.fileName}`;
      const publicUrl = buildPublicUrl(this.baseUrl, finalPath);

      return {
        success: true,
        path: finalPath,
        fileName: payload.fileName,
        publicUrl,
        url: publicUrl
      };
    });
  }

  /**
   * Resolves upload source into buffer payload.
   * @param source - Local path or in-memory bytes.
   * @param explicitFileName - Optional file name when source is in-memory data.
   * @returns Upload payload.
   */
  private async resolvePayload(source: UploadSource, explicitFileName?: string): Promise<UploadPayload> {
    if (typeof source === 'string') {
      const content = await readFile(source);
      return {
        fileName: extractFileName(source),
        content
      };
    }

    const fileName = explicitFileName?.trim();
    if (!fileName) {
      throw new ValidationError('fileName is required when uploading from in-memory bytes');
    }

    if (source instanceof ArrayBuffer) {
      return {
        fileName,
        content: Buffer.from(source)
      };
    }

    if (Buffer.isBuffer(source)) {
      return {
        fileName,
        content: source
      };
    }

    if (source instanceof Uint8Array) {
      return {
        fileName,
        content: Buffer.from(source)
      };
    }

    throw new ValidationError('Unsupported upload source type');
  }

  /**
   * Runs an authenticated request with one re-login retry on unauthorized response.
   * @param action - Callback that performs request using auth token.
   * @returns Result from callback.
   */
  private async withAuth<T>(action: (token: string) => Promise<T>): Promise<T> {
    const token = await this.authenticator.ensureAuth(this.httpClient);

    try {
      return await action(token);
    } catch (error) {
      if (error instanceof FileBrowserError && error.statusCode === 401) {
        this.authenticator.clearToken();
        const refreshedToken = await this.authenticator.login(this.httpClient);
        return action(refreshedToken);
      }

      if (error instanceof ValidationError || error instanceof UploadError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown upload error';
      throw new UploadError(`Upload failed: ${message}`);
    }
  }
}
