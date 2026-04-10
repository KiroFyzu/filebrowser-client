import { describe, expect, it } from 'vitest';

import { FileBrowserClient } from '../src/index.js';

describe('FileBrowserClient.fromEnv', () => {
  it('creates client when required env exists', () => {
    const env = {
      FILEBROWSER_BASE_URL: 'https://files.example.com',
      FILEBROWSER_USERNAME: 'admin',
      FILEBROWSER_PASSWORD: 'secret'
    } as NodeJS.ProcessEnv;

    const client = FileBrowserClient.fromEnv(env);
    expect(client).toBeInstanceOf(FileBrowserClient);
  });

  it('throws when env is incomplete', () => {
    const env = {
      FILEBROWSER_BASE_URL: 'https://files.example.com'
    } as NodeJS.ProcessEnv;

    expect(() => FileBrowserClient.fromEnv(env)).toThrow(
      /Missing FILEBROWSER_BASE_URL, FILEBROWSER_USERNAME, or FILEBROWSER_PASSWORD/
    );
  });
});
