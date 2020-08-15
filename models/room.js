// eslint-disable-next-line
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'room',
    {},
    {
      timestamps: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );
