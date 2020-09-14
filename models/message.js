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
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );
