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
      validate: {
        len: {
          args: [4, 100],
          msg: "description length must be between 4 and 100 characters"
        }
      },
    },
  });

  return Todo;
};
