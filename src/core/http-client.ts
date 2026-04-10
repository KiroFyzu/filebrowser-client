import { FileBrowserError } from './errors.js';

/**
 * Optional request parameters for low-level HTTP calls.
 */
export interface HttpRequestOptions {
  /** Additional headers for request. */
  headers?: HeadersInit;
  /** Request body. */
  body?: BodyInit;
  /** Auth token injected as X-Auth header when provided. */
  token?: string;
}

/**
 * Configuration for HttpClient.
 */
export interface HttpClientOptions {
  /** File Browser base URL. */
  baseUrl: string;
  /** Fetch implementation. */
  fetchImpl?: typeof fetch;
  /** Timeout in milliseconds. */
  requestTimeoutMs?: number;
}

/**
 * Small HTTP wrapper to standardize request and error behavior.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly requestTimeoutMs: number;

  /**
   * Creates a new HttpClient.
   * @param options - HttpClient options.
   */
  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 30_000;
  }

  /**
   * Sends request and returns parsed JSON response.
   * @param method - HTTP method.
   * @param path - Endpoint path.
   * @param options - Request options.
   * @returns Parsed JSON payload.
   */
  async requestJson<T>(method: string, path: string, options: HttpRequestOptions = {}): Promise<T> {
    const response = await this.request(method, path, options);
    return (await response.json()) as T;
  }

  /**
   * Sends request and returns plain text response.
   * @param method - HTTP method.
   * @param path - Endpoint path.
   * @param options - Request options.
   * @returns Response text.
   */
  async requestText(method: string, path: string, options: HttpRequestOptions = {}): Promise<string> {
    const response = await this.request(method, path, options);
    return response.text();
  }

  /**
   * Sends request when response body is not needed.
   * @param method - HTTP method.
   * @param path - Endpoint path.
   * @param options - Request options.
   */
  async requestVoid(method: string, path: string, options: HttpRequestOptions = {}): Promise<void> {
    await this.request(method, path, options);
  }

  /**
   * Sends request and returns raw response for advanced handling.
   * @param method - HTTP method.
   * @param path - Endpoint path.
   * @param options - Request options.
   * @returns Raw fetch response.
   */
  async request(method: string, path: string, options: HttpRequestOptions = {}): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    const headers = new Headers(options.headers ?? {});
    if (options.token) {
      headers.set('X-Auth', options.token);
    }

    try {
      const response = await this.fetchImpl(this.toAbsoluteUrl(path), {
        method,
        headers,
        body: options.body,
        signal: controller.signal
      });

      if (!response.ok) {
        const details = await this.readErrorBody(response);
        throw new FileBrowserError(
          `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          path,
          details
        );
      }

      return response;
    } catch (error) {
      if (error instanceof FileBrowserError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new FileBrowserError(
          `Request timeout after ${this.requestTimeoutMs}ms`,
          undefined,
          path
        );
      }

      const message = error instanceof Error ? error.message : 'Unknown request error';
      throw new FileBrowserError(`Request execution failed: ${message}`, undefined, path);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Reads response body safely for error diagnostics.
   * @param response - Failed response object.
   * @returns Truncated response body string.
   */
  private async readErrorBody(response: Response): Promise<string> {
    try {
      const body = await response.text();
      return body.slice(0, 2_000);
    } catch {
      return '';
    }
  }

  /**
   * Converts endpoint path into absolute URL.
   * @param path - Endpoint path.
   * @returns Absolute URL.
   */
  private toAbsoluteUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${this.baseUrl}${path}`;
  }
}
