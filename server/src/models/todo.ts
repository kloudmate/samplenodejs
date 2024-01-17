module.exports = (app) => {
  const db = app.get("db");
  const { sequelize, Sequelize } = db;
  const Todo = sequelize.define("Todo", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    description: {
      type: Sequelize.TEXT,
    },
  });

  return Todo;
};
