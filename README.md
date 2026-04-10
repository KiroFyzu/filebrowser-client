# filebrowser-client ![npm](https://img.shields.io/npm/v/filebrowser-client)

Reusable Node.js ESM client library for File Browser API, built with modular architecture and clean public API.

## Features

- Native Node.js ESM (Node 20+)
- No hardcoded credentials or base URL
- Modular internals: auth, http, file ops, upload, share
- TUS upload flow support (POST create + PATCH data)
- JSDoc on public methods and core modules
- Typed API via generated declaration files

## Installation

```bash
npm install filebrowser-client
```

## Quick Start

```ts
import { FileBrowserClient } from 'filebrowser-client';

const client = new FileBrowserClient({
  baseUrl: process.env.FILEBROWSER_BASE_URL!,
  username: process.env.FILEBROWSER_USERNAME!,
  password: process.env.FILEBROWSER_PASSWORD!
});

await client.login();
const items = await client.list('/');
console.log(items);
```

## Environment-Based Initialization

You can initialize directly from environment variables:

- FILEBROWSER_BASE_URL
- FILEBROWSER_USERNAME
- FILEBROWSER_PASSWORD

```ts
import { FileBrowserClient } from 'filebrowser-client';

const client = FileBrowserClient.fromEnv();
```

## Usage Examples

### Upload

```ts
import { readFile } from 'node:fs/promises';
import { FileBrowserClient } from 'filebrowser-client';

const client = FileBrowserClient.fromEnv();
const bytes = await readFile('./image.jpg');

const result = await client.upload(bytes, {
  fileName: 'image.jpg',
  remotePath: '/whatsapp-uploads',
  override: false
});

console.log(result);
```

### Delete

```ts
import { FileBrowserClient } from 'filebrowser-client';

const client = FileBrowserClient.fromEnv();
await client.delete('/whatsapp-uploads/image.jpg');
```

### List

```ts
import { FileBrowserClient } from 'filebrowser-client';

const client = FileBrowserClient.fromEnv();
const files = await client.list('/whatsapp-uploads');
console.log(files);
```

### Share

```ts
import { FileBrowserClient } from 'filebrowser-client';

const client = FileBrowserClient.fromEnv();

const share = await client.share('/whatsapp-uploads/image.jpg', {
  unit: 'days',
  value: 7
});

console.log('share url:', share.url);
console.log('direct url:', share.directUrl);
```

## API Documentation

### Constructor

```ts
new FileBrowserClient(options)
```

Options:

- baseUrl: string
- username: string
- password: string
- recaptcha?: string
- requestTimeoutMs?: number
- fetchImpl?: typeof fetch

### Authentication

- login(): Promise<string>
- logout(): void
- static fromEnv(env?): FileBrowserClient

### File Operations

- list(directoryPath?): Promise<FileBrowserResourceItem[]>
- info(resourcePath): Promise<T>
- mkdir(directoryPath): Promise<boolean>
- delete(resourcePath): Promise<boolean>

### Upload

- upload(source, options?): Promise<UploadResult>

Upload source supports:

- local file path
- Buffer
- Uint8Array
- ArrayBuffer

Upload options:

- remotePath?: string
- fileName?: string (required for in-memory bytes)
- override?: boolean

### Share

- share(resourcePath, options?): Promise<ShareResult>
- listShares(): Promise<ShareListItem[]>
- deleteShare(hash): Promise<boolean>
- getPublicUrl(resourcePath): string
- getInlineViewUrl(hash): string
- getDownloadUrl(hash): string

## Local Development

```bash
npm install
npm run build
npm run test
npm run lint
```

## Project Structure

```text
src/
  client/
  core/
  modules/
  types/
  utils/
examples/
tests/
```

## Publish Checklist

- Ensure repository, bugs, and homepage fields in package.json are correct
- Run npm run build
- Run npm run test
- Run npm run lint
- Run npm publish --dry-run

## License

MIT
