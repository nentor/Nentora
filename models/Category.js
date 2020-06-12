const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {}

  Category.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      name: { singular: "category", plural: "categories" },
    }
  );

  Category.associate = function (models) {
    // Category associations
    Category.hasOne(models.Thread, { foreignKey: "category_id" });
  };
  return Category;
};
