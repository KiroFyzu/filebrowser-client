import { Authenticator } from '../core/authenticator.js';
import { FileBrowserError } from '../core/errors.js';
import { HttpClient } from '../core/http-client.js';
import type { FileBrowserListResponse, FileBrowserResourceItem } from '../types/index.js';
import { buildResourcePath } from '../utils/path.js';

/**
 * Handles standard file and directory operations.
 */
export class FileApi {
  private readonly httpClient: HttpClient;
  private readonly authenticator: Authenticator;

  /**
   * Creates a FileApi instance.
   * @param httpClient - Shared HttpClient.
   * @param authenticator - Shared Authenticator.
   */
  constructor(httpClient: HttpClient, authenticator: Authenticator) {
    this.httpClient = httpClient;
    this.authenticator = authenticator;
  }

  /**
   * Lists resources in a directory.
   * @param directoryPath - Target directory path.
   * @returns Array of resource items.
   */
  async list(directoryPath = '/'): Promise<FileBrowserResourceItem[]> {
    return this.withAuth(async (token) => {
      const data = await this.httpClient.requestJson<FileBrowserListResponse>(
        'GET',
        buildResourcePath(directoryPath),
        { token }
      );

      return data.items ?? [];
    });
  }

  /**
   * Retrieves metadata for a file or directory.
   * @param resourcePath - Target resource path.
   * @returns Raw metadata object.
   */
  async info<T = Record<string, unknown>>(resourcePath: string): Promise<T> {
    return this.withAuth((token) =>
      this.httpClient.requestJson<T>('GET', buildResourcePath(resourcePath), { token })
    );
  }

  /**
   * Deletes a file or directory.
   * @param resourcePath - Resource path to remove.
   * @returns True when deletion succeeds.
   */
  async delete(resourcePath: string): Promise<boolean> {
    await this.withAuth((token) =>
      this.httpClient.requestVoid('DELETE', buildResourcePath(resourcePath), { token })
    );

    return true;
  }

  /**
   * Creates a directory.
   * @param directoryPath - Directory path to create.
   * @returns True when creation succeeds.
   */
  async mkdir(directoryPath: string): Promise<boolean> {
    await this.withAuth((token) =>
      this.httpClient.requestVoid('POST', buildResourcePath(directoryPath), {
        token,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'mkdir'
        })
      })
    );

    return true;
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
