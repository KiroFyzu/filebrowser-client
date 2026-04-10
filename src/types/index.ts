/**
 * Options used to configure a FileBrowserClient instance.
 */
export interface FileBrowserClientOptions {
  /** Base URL of File Browser instance, for example https://files.example.com */
  baseUrl: string;
  /** Login username */
  username: string;
  /** Login password */
  password: string;
  /** Optional recaptcha field used by File Browser login endpoint */
  recaptcha?: string;
  /** Request timeout in milliseconds */
  requestTimeoutMs?: number;
  /** Optional custom fetch implementation */
  fetchImpl?: typeof fetch;
}

/**
 * Credentials used by authenticator.
 */
export interface FileBrowserCredentials {
  /** Login username */
  username: string;
  /** Login password */
  password: string;
  /** Optional recaptcha token */
  recaptcha?: string;
}

/**
 * Shape of a resource item returned by File Browser list endpoint.
 */
export interface FileBrowserResourceItem {
  /** Item name */
  name: string;
  /** Full path for this item */
  path?: string;
  /** Indicates whether the item is a directory */
  isDir?: boolean;
  /** File size in bytes */
  size?: number;
  /** Last modified timestamp */
  modified?: string;
  /** Raw additional fields from File Browser */
  [key: string]: unknown;
}

/**
 * Response payload for directory listing endpoint.
 */
export interface FileBrowserListResponse {
  /** List of items contained in directory */
  items?: FileBrowserResourceItem[];
  /** Raw additional fields from File Browser */
  [key: string]: unknown;
}

/**
 * Upload input supports local path or in-memory data.
 */
export type UploadSource = string | Buffer | Uint8Array | ArrayBuffer;

/**
 * Optional parameters for uploading a file.
 */
export interface UploadOptions {
  /** Target directory in File Browser */
  remotePath?: string;
  /** Name of file if source is in-memory buffer */
  fileName?: string;
  /** Whether existing file should be overridden */
  override?: boolean;
}

/**
 * Result payload returned after upload completes.
 */
export interface UploadResult {
  /** Upload status */
  success: boolean;
  /** Uploaded file path */
  path: string;
  /** Uploaded file name */
  fileName: string;
  /** Public URL for direct download */
  publicUrl: string;
  /** Alias for publicUrl */
  url: string;
}

/**
 * Optional share creation settings accepted by File Browser.
 */
export interface ShareOptions {
  /** Predefined expiration descriptor */
  expires?: string;
  /** Time unit for expiry config */
  unit?: 'hours' | 'days' | 'months' | 'years';
  /** Numeric value for expiry config */
  value?: number;
  /** Raw additional share options */
  [key: string]: unknown;
}

/**
 * Result payload returned after share link creation.
 */
export interface ShareResult {
  /** Operation status */
  success: boolean;
  /** Share hash */
  hash: string;
  /** User-facing share page URL */
  url: string;
  /** Direct public API URL for share */
  directUrl: string;
  /** Expiration value returned by API */
  expires: number;
  /** Original file path */
  path: string;
}

/**
 * Share entry returned by listShares endpoint.
 */
export interface ShareListItem {
  /** Share hash */
  hash: string;
  /** Target path */
  path?: string;
  /** Expiration timestamp or counter */
  expire?: number;
  /** Raw additional fields from File Browser */
  [key: string]: unknown;
}
