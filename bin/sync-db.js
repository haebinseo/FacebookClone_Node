const sequelize = require('../models');

module.exports = () => {
  return sequelize.sync({ force: false });
};
