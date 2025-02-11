'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reservasi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Reservasi.init({
    nama_pertemuan: DataTypes.STRING,
    ruangan: DataTypes.id,
    pj: DataTypes.STRING,
    wa_pj: DataTypes.STRING,
    bidang: DataTypes.STRING,
    tanggal: DataTypes.DATEONLY,
    jam_mulai: DataTypes.TIME,
    jam_selesai: DataTypes.TIME,
    keterangan: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Reservasi',
  });
  return Reservasi;
};