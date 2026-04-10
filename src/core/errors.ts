/**
 * Base error type for all File Browser client failures.
 */
export class FileBrowserError extends Error {
  /** HTTP status code when available. */
  public readonly statusCode?: number;

  /** Endpoint path used when the error happened. */
  public readonly endpoint?: string;

  /** Raw response body or context details when available. */
  public readonly details?: string;

  /**
   * Creates a FileBrowserError.
   * @param message - Human-readable error message.
   * @param statusCode - Optional HTTP status code.
   * @param endpoint - Optional endpoint path.
   * @param details - Optional details for troubleshooting.
   */
  constructor(message: string, statusCode?: number, endpoint?: string, details?: string) {
    super(message);
    this.name = 'FileBrowserError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

/**
 * Error type for authentication and token-related failures.
 */
export class AuthError extends FileBrowserError {
  /**
   * Creates an AuthError.
   * @param message - Human-readable error message.
   * @param statusCode - Optional HTTP status code.
   * @param endpoint - Optional endpoint path.
   * @param details - Optional details for troubleshooting.
   */
  constructor(message: string, statusCode?: number, endpoint?: string, details?: string) {
    super(message, statusCode, endpoint, details);
    this.name = 'AuthError';
  }
}

/**
 * Error type for upload failures.
 */
export class UploadError extends FileBrowserError {
  /**
   * Creates an UploadError.
   * @param message - Human-readable error message.
   * @param statusCode - Optional HTTP status code.
   * @param endpoint - Optional endpoint path.
   * @param details - Optional details for troubleshooting.
   */
  constructor(message: string, statusCode?: number, endpoint?: string, details?: string) {
    super(message, statusCode, endpoint, details);
    this.name = 'UploadError';
  }
}

/**
 * Error type for invalid input validation failures.
 */
export class ValidationError extends FileBrowserError {
  /**
   * Creates a ValidationError.
   * @param message - Human-readable validation error message.
   */
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
