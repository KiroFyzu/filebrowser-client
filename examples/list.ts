import { FileBrowserClient } from '../src/index.js';

async function main(): Promise<void> {
  const client = FileBrowserClient.fromEnv();

  const items = await client.list('/whatsapp-uploads');
  console.log('Directory items:', items);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
