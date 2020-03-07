'use strict';
module.exports = (sequelize, DataTypes) => {
  const OTPEntries = sequelize.define('OTPEntries', {
    id: DataTypes.UUID,
    user_id: DataTypes.INTEGER,
    otp: DataTypes.STRING
  }, {});
  OTPEntries.associate = function(models) {
    // associations can be defined here
     OTPEntries.belongsTo(models.User, {
        foreignKey: 'user_id'
     });
  };
  return OTPEntries;
};