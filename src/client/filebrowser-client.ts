import { Authenticator } from '../core/authenticator.js';
import { HttpClient } from '../core/http-client.js';
import { FileApi } from '../modules/file-api.js';
import { ShareApi } from '../modules/share-api.js';
import { UploadApi } from '../modules/upload-api.js';
import type {
  FileBrowserClientOptions,
  FileBrowserResourceItem,
  ShareListItem,
  ShareOptions,
  ShareResult,
  UploadOptions,
  UploadResult,
  UploadSource
} from '../types/index.js';
import { normalizeBaseUrl } from '../utils/path.js';

/**
 * Main reusable client for File Browser API.
 */
export class FileBrowserClient {
  private readonly httpClient: HttpClient;
  private readonly authenticator: Authenticator;
  private readonly fileApi: FileApi;
  private readonly uploadApi: UploadApi;
  private readonly shareApi: ShareApi;

  /**
   * Creates a new FileBrowserClient.
   * @param options - Client configuration.
   */
  constructor(options: FileBrowserClientOptions) {
    const baseUrl = normalizeBaseUrl(options.baseUrl);

    this.httpClient = new HttpClient({
      baseUrl,
      fetchImpl: options.fetchImpl,
      requestTimeoutMs: options.requestTimeoutMs
    });

    this.authenticator = new Authenticator({
      username: options.username,
      password: options.password,
      recaptcha: options.recaptcha
    });

    this.fileApi = new FileApi(this.httpClient, this.authenticator);
    this.uploadApi = new UploadApi(this.httpClient, this.authenticator, baseUrl);
    this.shareApi = new ShareApi(this.httpClient, this.authenticator, baseUrl);
  }

  /**
   * Performs login and returns auth token.
   * @returns Auth token.
   */
  async login(): Promise<string> {
    return this.authenticator.login(this.httpClient);
  }

  /**
   * Uploads a file to File Browser using TUS endpoints.
   * @param source - Local path or in-memory bytes.
   * @param options - Upload options.
   * @returns Upload result payload.
   */
  async upload(source: UploadSource, options: UploadOptions = {}): Promise<UploadResult> {
    return this.uploadApi.upload(source, options);
  }

  /**
   * Deletes a resource by path.
   * @param resourcePath - Path to file or folder.
   * @returns True when deletion succeeds.
   */
  async delete(resourcePath: string): Promise<boolean> {
    return this.fileApi.delete(resourcePath);
  }

  /**
   * Lists resources in a directory.
   * @param directoryPath - Directory path.
   * @returns Array of resource items.
   */
  async list(directoryPath = '/'): Promise<FileBrowserResourceItem[]> {
    return this.fileApi.list(directoryPath);
  }

  /**
   * Retrieves metadata for a resource path.
   * @param resourcePath - File or directory path.
   * @returns Resource metadata.
   */
  async info<T = Record<string, unknown>>(resourcePath: string): Promise<T> {
    return this.fileApi.info<T>(resourcePath);
  }

  /**
   * Creates a new directory.
   * @param directoryPath - Directory path to create.
   * @returns True when creation succeeds.
   */
  async mkdir(directoryPath: string): Promise<boolean> {
    return this.fileApi.mkdir(directoryPath);
  }

  /**
   * Creates a share link for a file.
   * @param resourcePath - Path to file.
   * @param options - Share options.
   * @returns Share result payload.
   */
  async share(resourcePath: string, options: ShareOptions = {}): Promise<ShareResult> {
    return this.shareApi.share(resourcePath, options);
  }

  /**
   * Retrieves all share links.
   * @returns Array of share entries.
   */
  async listShares(): Promise<ShareListItem[]> {
    return this.shareApi.listShares();
  }

  /**
   * Deletes a share link by hash.
   * @param hash - Share hash.
   * @returns True when deletion succeeds.
   */
  async deleteShare(hash: string): Promise<boolean> {
    return this.shareApi.deleteShare(hash);
  }

  /**
   * Builds public URL for direct file access.
   * @param resourcePath - File path.
   * @returns Public URL.
   */
  getPublicUrl(resourcePath: string): string {
    return this.shareApi.getPublicUrl(resourcePath);
  }

  /**
   * Builds inline-view URL by share hash.
   * @param hash - Share hash.
   * @returns Inline-view URL.
   */
  getInlineViewUrl(hash: string): string {
    return this.shareApi.getInlineViewUrl(hash);
  }

  /**
   * Builds download URL by share hash.
   * @param hash - Share hash.
   * @returns Download URL.
   */
  getDownloadUrl(hash: string): string {
    return this.shareApi.getDownloadUrl(hash);
  }

  /**
   * Clears current auth token from memory.
   */
  logout(): void {
    this.authenticator.clearToken();
  }

  /**
   * Factory helper to create a client from environment variables.
   * @param env - Environment map source.
   * @returns Configured FileBrowserClient.
   */
  static fromEnv(env: NodeJS.ProcessEnv = process.env): FileBrowserClient {
    const baseUrl = env.FILEBROWSER_BASE_URL;
    const username = env.FILEBROWSER_USERNAME;
    const password = env.FILEBROWSER_PASSWORD;

    if (!baseUrl || !username || !password) {
      throw new Error(
        'Missing FILEBROWSER_BASE_URL, FILEBROWSER_USERNAME, or FILEBROWSER_PASSWORD environment variables'
      );
    }

    return new FileBrowserClient({
      baseUrl,
      username,
      password
    });
  }
}
