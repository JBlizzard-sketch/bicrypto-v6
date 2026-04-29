"use strict";
/**
 * Direct Models Loader - Bypasses broken db.js
 * Initializes Sequelize and loads all models independently
 */

const { Sequelize } = require("sequelize");
const path = require("path");

let sequelizeInstance = null;
let modelsCache = null;

function createSequelize() {
    if (sequelizeInstance) return sequelizeInstance;
    
    const dbConfig = {
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        dialect: "mysql",
        logging: false,
        dialectOptions: {
            charset: "utf8mb4"
        },
        define: {
            charset: "utf8mb4",
            collate: "utf8mb4_unicode_ci"
        }
    };
    
    sequelizeInstance = new Sequelize(
        process.env.DB_NAME || "bicrypto",
        process.env.DB_USER || "root",
        process.env.DB_PASSWORD || "",
        dbConfig
    );
    
    return sequelizeInstance;
}

function loadModels() {
    if (modelsCache && Object.keys(modelsCache).length > 0) {
        return modelsCache;
    }
    
    try {
        const sequelize = createSequelize();
        const initModels = require("./models/init").initModels;
        modelsCache = initModels(sequelize);
        
        if (!modelsCache || Object.keys(modelsCache).length === 0) {
            throw new Error("initModels returned empty object");
        }
        
        console.log("[MODELS-LOADER] ✓ Loaded", Object.keys(modelsCache).length, "models:", Object.keys(modelsCache).slice(0, 10).join(", ") + "...");
        return modelsCache;
    } catch (error) {
        console.error("[MODELS-LOADER] ✗ Failed to load models:", error.message);
        throw error;
    }
}

// Initialize on first require
const models = loadModels();

// Export both ways for compatibility
module.exports = {
    models: models,
    sequelize: sequelizeInstance,
    getModels: () => models,
    getSequelize: () => sequelizeInstance,
    // Direct exports for backwards compatibility
    ...models
};

// Also make available globally
global.bicryptoModels = models;
global.bicryptoSequelize = sequelizeInstance;

console.log("[MODELS-LOADER] Models system ready");
