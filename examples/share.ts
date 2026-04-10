import { FileBrowserClient } from '../src/index.js';

async function main(): Promise<void> {
  const client = FileBrowserClient.fromEnv();

  const shareInfo = await client.share('/whatsapp-uploads/image.jpg', {
    unit: 'days',
    value: 7
  });

  console.log('Share info:', shareInfo);

  const shares = await client.listShares();
  console.log('Current shares:', shares);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
