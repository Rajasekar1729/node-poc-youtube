'use strict';
module.exports = (sequelize, DataTypes) => {
  const OTPResetPassword = sequelize.define('OTPResetPassword', {
    uniqueId: DataTypes.UUID,
    user_id: DataTypes.INTEGER,
    otp: DataTypes.STRING
  }, {});
  OTPResetPassword.associate = function(models) {
    // associations can be defined here
  };
  return OTPResetPassword;
};