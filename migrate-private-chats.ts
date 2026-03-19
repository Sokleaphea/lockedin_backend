import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Inline the schema here so this script is self-contained
// and doesn't depend on the new model having member1/member2 required
const privateChatSchema = new mongoose.Schema(
  {
    members: { type: [Types.ObjectId], required: true },
    member1: { type: Types.ObjectId },
    member2: { type: Types.ObjectId },
  },
  { timestamps: true }
);

const PrivateChat = mongoose.model("PrivateChat", privateChatSchema);

const migrate = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected\n");

  const chats = await PrivateChat.find({
    $or: [
      { member1: { $exists: false } },
      { member2: { $exists: false } },
    ],
  });

  if (chats.length === 0) {
    console.log("✅ No chats need migrating. All done!");
    await mongoose.disconnect();
    return;
  }

  console.log(`📦 Found ${chats.length} chat(s) to migrate...\n`);

  let success = 0;
  let failed = 0;

  for (const chat of chats) {
    try {
      const [m1, m2] = (chat.members as unknown as Types.ObjectId[])
        .map((m) => m.toString())
        .sort((a, b) => a.localeCompare(b));

      chat.member1 = new Types.ObjectId(m1);
      chat.member2 = new Types.ObjectId(m2);
      await chat.save();

      console.log(`  ✅ Migrated chat ${chat._id}  →  member1: ${m1}  member2: ${m2}`);
      success++;
    } catch (err) {
      console.error(`  ❌ Failed to migrate chat ${chat._id}:`, err);
      failed++;
    }
  }

  console.log(`\n🎉 Migration complete — ${success} succeeded, ${failed} failed`);

  if (failed > 0) {
    console.log("⚠️  Some chats failed. Do NOT drop the old index yet.");
    process.exit(1);
  }

  console.log("\n📌 Next steps:");
  console.log("   1. Drop the old index in MongoDB:");
  console.log('      db.privatechats.dropIndex("members_1")');
  console.log("   2. Deploy the new model + controller\n");

  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
