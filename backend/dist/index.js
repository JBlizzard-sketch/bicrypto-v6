"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Try multiple paths for .env file - prioritize root .env file
const envPaths = [
    path_1.default.resolve(process.cwd(), ".env"),
    path_1.default.resolve(__dirname, "../.env"),
    path_1.default.resolve(__dirname, ".env"),
    path_1.default.resolve(process.cwd(), "../.env"),
];
let envLoaded = false;
for (const envPath of envPaths) {
    if (fs_1.default.existsSync(envPath)) {
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
require("./module-alias-setup");
const src_1 = require("./src");
const console_1 = require("./src/utils/console");
const fix_mysql57_defaults_1 = require("./src/utils/fix-mysql57-defaults");
const port = process.env.NEXT_PUBLIC_BACKEND_PORT || 4000;
const startApp = async () => {
    try {
        const app = new src_1.MashServer();
        // Fix MySQL 5.7+ schema defaults BEFORE initialization
        await fix_mysql57_defaults_1.fixMySQL57SchemaDefaults(app.sequelize);
        // Start server - this waits for init then listens, showing "ready" only when all is done
        await app.startServer(Number(port));
    }
    catch (error) {
        console_1.console$.error("Failed to start server", error);
        console_1.logger.error("APP", "Failed to initialize app", error);
        process.exit(1);
    }
};
startApp();
