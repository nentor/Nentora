const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Follower extends Model {}

  Follower.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      name: { singular: "follower", plural: "followers" },
    }
  );

  Follower.associate = function (models) {
    // Follower associations
    Follower.belongsTo(models.User, { foreignKey: "user_id" });
  };
  return Follower;
};
