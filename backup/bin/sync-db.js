const { sequelize } = require('../db/models');

module.exports = () => {
  return sequelize.sync({ force: false });
};
