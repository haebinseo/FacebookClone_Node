module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'user',
    {
      email: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      profileImg: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: '/images/main/mainCenter/anonymous_userImg.jpg',
      },
    },
    {
      timestamps: true,
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );
