import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import dns from "dns";

dns.setServers(["1.1.1.1", "1.0.0.1"]);
dotenv.config();

const startServer = async () => {

  try {
    console.log(
      "MONGO_URI:",
      process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌"
    );

    await connectDB();

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log("Running on http://localhost:5000");
    });
  } catch (error) {
    console.error("❌ Startup error:", error.message);
    process.exit(1);
  }
};

startServer();
