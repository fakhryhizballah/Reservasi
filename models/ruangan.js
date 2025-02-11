'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ruangan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Ruangan.init({
    nama: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ruangan',
  });
  return Ruangan;
};