import 'dotenv/config';
import { streamServerClient } from './src/config/stream';

async function main() {
  const channels = await streamServerClient.queryChannels(
    { type: 'messaging' },
    {},
    { limit: 30 }
  );
  channels.forEach((c: any) => console.log(c.id, '|', c.data?.name));
}

main().catch(console.error);
