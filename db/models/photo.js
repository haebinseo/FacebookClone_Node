module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'photo',
    {
      url: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );
