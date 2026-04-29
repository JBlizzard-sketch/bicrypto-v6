// File: index.ts

// Load environment variables with multiple path fallbacks
import path from "path";
import fs from "fs";

// Try multiple paths for .env file - prioritize root .env file
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, ".env"),
  path.resolve(process.cwd(), "../.env"),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  // No .env file found — this is expected in production environments like Railway
  // where environment variables are injected directly into the process.
  // Silently continue; process.env will already contain all required variables.
  if (process.env.NODE_ENV !== "production") {
    console.info("Backend: No .env file found — using environment variables from the host.");
  }
}

import "./module-alias-setup";
import { MashServer } from "./src";
import { console$, logger } from "./src/utils/console";
import { fixMySQL57SchemaDefaults } from "./src/utils/fix-mysql57-defaults";

const port = process.env.NEXT_PUBLIC_BACKEND_PORT || 4000;

const startApp = async () => {
  try {
    const app = new MashServer();
    // Fix MySQL 5.7+ schema defaults BEFORE initialization
    await fixMySQL57SchemaDefaults(app.sequelize);
    // Start server - this waits for init then listens, showing "ready" only when all is done
    await app.startServer(Number(port));
  } catch (error) {
    console$.error("Failed to start server", error);
    logger.error("APP", "Failed to initialize app", error);
    process.exit(1);
  }
};

startApp();
