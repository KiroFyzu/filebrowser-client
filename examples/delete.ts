import { FileBrowserClient } from '../src/index.js';

async function main(): Promise<void> {
  const client = FileBrowserClient.fromEnv();

  const isDeleted = await client.delete('/whatsapp-uploads/image.jpg');
  console.log('Delete success:', isDeleted);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
