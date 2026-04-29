// Models wrapper - ensures all models are accessible
const initModels = require("../models/init").initModels;
const { Sequelize } = require("sequelize");

let modelsCache = null;

function getModels(sequelize) {
    if (!modelsCache) {
        modelsCache = initModels(sequelize);
    }
    return modelsCache;
}

module.exports = { getModels };
