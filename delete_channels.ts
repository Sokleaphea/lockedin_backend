import 'dotenv/config';
import { streamServerClient } from './src/config/stream';

const toDelete = [
  'group-69b399c4f72309fcffaebaf2', // MamaJadjad x Nobbuu GC
  'group-69b50db29b0dcaa76c9ed4c2', // After the purge
];

async function main() {
  for (const id of toDelete) {
    try {
      await streamServerClient.channel('messaging', id).delete();
      console.log('✅ deleted:', id);
    } catch (e) {
      console.error('❌ failed:', id, e);
    }
  }
}

main();
