'use strict';
module.exports = (sequelize, DataTypes) => {
  const YoutubeFavorite = sequelize.define('YoutubeFavorite', {
    user_id: DataTypes.INTEGER,
    videoId: DataTypes.STRING
  }, {});
  YoutubeFavorite.associate = function(models) {
    // associations can be defined here
  };
  return YoutubeFavorite;
};