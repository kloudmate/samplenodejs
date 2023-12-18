
module.exports = (app) => {
    const db = app.get('db')
    const { sequelize, Sequelize } = db
    // Todo table
    const Todo = sequelize.define('Todo', {
        title: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.TEXT,
        },
    });

    return Todo
}
