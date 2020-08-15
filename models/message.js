module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'message',
    {
      content: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      img: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );
