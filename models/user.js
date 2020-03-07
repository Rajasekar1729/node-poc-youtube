'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
    isSuperUser: DataTypes.BOOLEAN
  }, {});
  User.associate = function(models) {
    // User.hasMany(models.User, {
    //       foreignKey: 'user_id',
    //       as: 'user'
    //  });
  };
  return User;
};