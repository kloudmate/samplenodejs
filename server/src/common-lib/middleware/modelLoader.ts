import path from 'path';
import fs from 'fs';
import customLogger from './logger';

const logger = customLogger(path.basename(__filename));

const loadModels = async (app) => {
  const modelsPath = path.join(__dirname, '../../models'); // Adjust the path based on your project structure
  const db = app.get('db');
  const { sequelize, Sequelize } = db;

  try {
    // Read all files in the models directory
    const modelFiles = fs.readdirSync(modelsPath);

    // Load and sync each model
    modelFiles.forEach(async (file) => {
      if (file.endsWith('.js')) {
        const modelModule = await import(path.join(modelsPath, file));
        const model = modelModule.default(app, sequelize, Sequelize);

        if (model && typeof model.sync === 'function') {
          await model.sync();
          logger.info(`${model.name} model synced`);
        }
      }
    });

    logger.info('All models synced successfully');
  } catch (error) {
    logger.error(`Error loading and syncing models: ${error}`);
  }
};

export default loadModels;
