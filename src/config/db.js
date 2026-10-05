import mongoose from "mongoose";
import { seedRoles } from "../seeds/role_seed.js";
import { seedSuperAdmin } from "../seeds/user_seed.js";
import { seedStates } from "../seeds/state_seed.js";
import { seedDistricts } from "../seeds/district_seeds.js";
import { seedBlocks } from "../seeds/block_seeds.js";
import { seedVillages } from "../seeds/village_seeds.js";
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      tls: true,
    });
    // await seedSuperAdmin();
    // await seedRoles();
    // await seedStates();
    // await seedDistricts();
    // await seedBlocks();
    // await seedVillages();
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("\n❌ MongoDB Connection Error");
    console.error("Name:", error.name);
    console.error("Message:", error.message);

    if (error.reason?.servers) {
      console.error("\n🔍 Server errors:");

      for (const [address, server] of error.reason.servers) {
        console.error(`\n${address}`);
        console.error(server.error);
      }
    }

    throw error;
  }
};

export default connectDB;