module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'friend',
    {
      // id: {
      //   type: DataTypes.INTEGER,
      //   autoIncrement: true,
      //   primaryKey: true,
      // },
      followerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      followingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );
