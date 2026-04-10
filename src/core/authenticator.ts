import { AuthError } from './errors.js';
import type { HttpClient } from './http-client.js';
import type { FileBrowserCredentials } from '../types/index.js';

/**
 * Handles authentication and in-memory token lifecycle.
 */
export class Authenticator {
  private readonly credentials: FileBrowserCredentials;
  private token: string | null = null;

  /**
   * Creates a new Authenticator.
   * @param credentials - File Browser login credentials.
   */
  constructor(credentials: FileBrowserCredentials) {
    this.credentials = credentials;
  }

  /**
   * Performs login and stores token in memory.
   * @param httpClient - Shared HttpClient instance.
   * @returns Auth token string.
   */
  async login(httpClient: HttpClient): Promise<string> {
    try {
      const payload = JSON.stringify({
        username: this.credentials.username,
        password: this.credentials.password,
        recaptcha: this.credentials.recaptcha ?? ''
      });

      const rawToken = await httpClient.requestText('POST', '/api/login', {
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      });

      this.token = rawToken.replaceAll('"', '').trim();
      if (!this.token) {
        throw new AuthError('Login succeeded but token is empty', undefined, '/api/login');
      }

      return this.token;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown auth error';
      throw new AuthError(`Login failed: ${message}`, undefined, '/api/login');
    }
  }

  /**
   * Ensures token is available and returns it.
   * @param httpClient - Shared HttpClient instance.
   * @returns Valid auth token.
   */
  async ensureAuth(httpClient: HttpClient): Promise<string> {
    if (this.token) {
      return this.token;
    }

    return this.login(httpClient);
  }

  /**
   * Clears currently stored token.
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Returns current token without forcing login.
   * @returns Current token or null.
   */
  getToken(): string | null {
    return this.token;
  }
}
