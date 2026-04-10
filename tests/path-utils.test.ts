import { describe, expect, it } from 'vitest';

import {
  buildDownloadUrl,
  buildPublicUrl,
  buildResourcePath,
  buildSharePath,
  buildTusPath,
  normalizeAbsolutePath,
  normalizeBaseUrl
} from '../src/utils/path.js';

describe('path utilities', () => {
  it('normalizes base URL', () => {
    expect(normalizeBaseUrl('https://files.example.com/')).toBe('https://files.example.com');
  });

  it('normalizes absolute path', () => {
    expect(normalizeAbsolutePath('folder/file.jpg')).toBe('/folder/file.jpg');
    expect(normalizeAbsolutePath('/folder/file.jpg')).toBe('/folder/file.jpg');
  });

  it('builds resource path', () => {
    expect(buildResourcePath('uploads/a.jpg')).toBe('/api/resources/uploads/a.jpg');
  });

  it('builds share path', () => {
    expect(buildSharePath('/uploads/image one.jpg')).toBe('/api/share/uploads/image%20one.jpg');
  });

  it('builds tus path', () => {
    expect(buildTusPath('/uploads', 'a b.jpg', false)).toBe('/api/tus/uploads/a%20b.jpg?override=false');
  });

  it('builds public URLs', () => {
    expect(buildPublicUrl('https://files.example.com/', '/uploads/a.jpg')).toBe(
      'https://files.example.com/api/public/dl/uploads/a.jpg'
    );

    expect(buildDownloadUrl('https://files.example.com', 'abc123')).toBe(
      'https://files.example.com/api/public/dl/abc123'
    );
  });
});
