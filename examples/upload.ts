import { readFile } from 'node:fs/promises';

import { FileBrowserClient } from '../src/index.js';

async function main(): Promise<void> {
  const client = FileBrowserClient.fromEnv();

  const imageBytes = await readFile('./assets/image.jpg');

  const result = await client.upload(imageBytes, {
    fileName: 'image.jpg',
    remotePath: '/whatsapp-uploads',
    override: false
  });

  console.log('Upload result:', result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
