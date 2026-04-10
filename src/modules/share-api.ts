import { Authenticator } from '../core/authenticator.js';
import { FileBrowserError } from '../core/errors.js';
import { HttpClient } from '../core/http-client.js';
import type { ShareListItem, ShareOptions, ShareResult } from '../types/index.js';
import {
  buildDownloadUrl,
  buildInlineViewUrl,
  buildPublicUrl,
  buildSharePageUrl,
  buildSharePath
} from '../utils/path.js';

interface ShareCreateResponse {
  hash: string;
  expire?: number;
}

/**
 * Handles share-link related operations.
 */
export class ShareApi {
  private readonly httpClient: HttpClient;
  private readonly authenticator: Authenticator;
  private readonly baseUrl: string;

  /**
   * Creates a ShareApi instance.
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
   * Creates a share link for a resource.
   * @param resourcePath - File path to share.
   * @param options - Share configuration.
   * @returns Share metadata containing generated URLs.
   */
  async share(resourcePath: string, options: ShareOptions = {}): Promise<ShareResult> {
    return this.withAuth(async (token) => {
      const data = await this.httpClient.requestJson<ShareCreateResponse>('POST', buildSharePath(resourcePath), {
        token,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      return {
        success: true,
        hash: data.hash,
        url: buildSharePageUrl(this.baseUrl, data.hash),
        directUrl: `${this.baseUrl}/api/public/share/${encodeURIComponent(data.hash)}`,
        expires: data.expire ?? 0,
        path: resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`
      };
    });
  }

  /**
   * Retrieves all share links.
   * @returns Array of shares.
   */
  async listShares(): Promise<ShareListItem[]> {
    return this.withAuth((token) => this.httpClient.requestJson<ShareListItem[]>('GET', '/api/shares', { token }));
  }

  /**
   * Deletes an existing share by hash.
   * @param hash - Share hash.
   * @returns True when deletion succeeds.
   */
  async deleteShare(hash: string): Promise<boolean> {
    await this.withAuth((token) =>
      this.httpClient.requestVoid('DELETE', `/api/share/${encodeURIComponent(hash)}`, { token })
    );

    return true;
  }

  /**
   * Builds public URL for direct file access.
   * @param resourcePath - File path.
   * @returns Public URL.
   */
  getPublicUrl(resourcePath: string): string {
    return buildPublicUrl(this.baseUrl, resourcePath);
  }

  /**
   * Builds inline-view URL using share hash.
   * @param hash - Share hash.
   * @returns Inline-view URL.
   */
  getInlineViewUrl(hash: string): string {
    return buildInlineViewUrl(this.baseUrl, hash);
  }

  /**
   * Builds download URL using share hash.
   * @param hash - Share hash.
   * @returns Download URL.
   */
  getDownloadUrl(hash: string): string {
    return buildDownloadUrl(this.baseUrl, hash);
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

      throw error;
    }
  }
}
