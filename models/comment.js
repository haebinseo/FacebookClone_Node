module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'comment',
    {
      content: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      bundleCreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      depth: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );
