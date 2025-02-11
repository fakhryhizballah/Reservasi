'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reservasis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_pertemuan: {
        type: Sequelize.STRING
      },
      pj: {
        type: Sequelize.STRING
      },
      wa_pj: {
        type: Sequelize.STRING
      },
      bidang: {
        type: Sequelize.STRING
      },
      tanggal: {
        type: Sequelize.DATEONLY
      },
      jam_mulai: {
        type: Sequelize.TIME
      },
      jam_selesai: {
        type: Sequelize.TIME
      },
      keterangan: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reservasis');
  }
};