import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  await mongoose.connection.collection('privatechats').dropIndex('members_1');
  console.log('✅ Index dropped successfully');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
