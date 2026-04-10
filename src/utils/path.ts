import { basename } from 'node:path';

import { ValidationError } from '../core/errors.js';

/**
 * Normalizes base URL by removing trailing slash.
 * @param baseUrl - File Browser server URL.
 * @returns Normalized base URL.
 */
export function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed) {
    throw new ValidationError('baseUrl is required');
  }

  return trimmed.replace(/\/+$/, '');
}

/**
 * Ensures a path starts with slash.
 * @param inputPath - Resource path.
 * @returns Absolute-style path.
 */
export function normalizeAbsolutePath(inputPath: string): string {
  const value = inputPath.trim();
  if (!value || value === '/') {
    return '/';
  }

  return value.startsWith('/') ? value : `/${value}`;
}

/**
 * Ensures a path starts and ends with slash for directory usage.
 * @param inputPath - Directory path.
 * @returns Normalized directory path.
 */
export function normalizeDirectoryPath(inputPath: string): string {
  const absolute = normalizeAbsolutePath(inputPath);
  return absolute.endsWith('/') ? absolute : `${absolute}/`;
}

/**
 * Converts resource path to share endpoint suffix without leading slash.
 * @param resourcePath - Target resource path.
 * @returns Path suitable for /api/share endpoint.
 */
export function toSharePath(resourcePath: string): string {
  const absolute = normalizeAbsolutePath(resourcePath);
  return absolute.slice(1);
}

/**
 * Encodes path segments while preserving slash separators.
 * @param value - Path-like value.
 * @returns Encoded path.
 */
export function encodePathSegments(value: string): string {
  return value
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/**
 * Extracts file name from local file path.
 * @param filePath - Local file system path.
 * @returns File name.
 */
export function extractFileName(filePath: string): string {
  const name = basename(filePath);
  if (!name) {
    throw new ValidationError(`Unable to determine file name from path: ${filePath}`);
  }

  return name;
}

/**
 * Creates TUS upload endpoint path.
 * @param remotePath - Destination directory path.
 * @param fileName - File name.
 * @param override - Whether overwrite is enabled.
 * @returns Endpoint path ready for request.
 */
export function buildTusPath(remotePath: string, fileName: string, override: boolean): string {
  const cleanDirectory = normalizeDirectoryPath(remotePath);
  const encodedDirectory = encodePathSegments(cleanDirectory);
  const encodedFileName = encodeURIComponent(fileName);
  const overrideValue = override ? 'true' : 'false';

  return `/api/tus${encodedDirectory}${encodedFileName}?override=${overrideValue}`;
}

/**
 * Creates resource endpoint path.
 * @param resourcePath - Target resource path.
 * @returns Resource endpoint path.
 */
export function buildResourcePath(resourcePath: string): string {
  return `/api/resources${normalizeAbsolutePath(resourcePath)}`;
}

/**
 * Creates share endpoint path for a specific file.
 * @param resourcePath - Target resource path.
 * @returns Share endpoint path.
 */
export function buildSharePath(resourcePath: string): string {
  return `/api/share/${encodePathSegments(toSharePath(resourcePath))}`;
}

/**
 * Creates public download URL from file path.
 * @param baseUrl - File Browser server URL.
 * @param resourcePath - File path.
 * @returns Public download URL.
 */
export function buildPublicUrl(baseUrl: string, resourcePath: string): string {
  return `${normalizeBaseUrl(baseUrl)}/api/public/dl${normalizeAbsolutePath(resourcePath)}`;
}

/**
 * Creates public inline-view URL from share hash.
 * @param baseUrl - File Browser server URL.
 * @param hash - Share hash.
 * @returns Inline-view URL.
 */
export function buildInlineViewUrl(baseUrl: string, hash: string): string {
  return `${normalizeBaseUrl(baseUrl)}/api/public/dl/${encodeURIComponent(hash)}?inline=true`;
}

/**
 * Creates public download URL from share hash.
 * @param baseUrl - File Browser server URL.
 * @param hash - Share hash.
 * @returns Download URL.
 */
export function buildDownloadUrl(baseUrl: string, hash: string): string {
  return `${normalizeBaseUrl(baseUrl)}/api/public/dl/${encodeURIComponent(hash)}`;
}

/**
 * Creates share page URL from share hash.
 * @param baseUrl - File Browser server URL.
 * @param hash - Share hash.
 * @returns Share page URL.
 */
export function buildSharePageUrl(baseUrl: string, hash: string): string {
  return `${normalizeBaseUrl(baseUrl)}/share/${encodeURIComponent(hash)}`;
}
