const path = require('path');
const { Reservasi } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');
module.exports = {
    async fomrReservasi(req, res) {
        try {
            res.sendFile(path.join(__dirname, './../views/', 'index.html'));

        } catch (err) {
            return res.status(400).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    },
    async postReservasi(req, res) {
        try {

            req.body.status = 'active';
            let restID = await Reservasi.create(req.body);
            let random = Math.floor(Math.random() * 10000)
            let random2 = Math.floor(Math.random() * 10000)
            let id = random2 + ':' + restID.id + ':' + random
            id = Buffer.from(id).toString('base64');

            let data = JSON.stringify({
                "message":
                    `Terimakasih atas reservasi anda di ruangan ${req.body.ruangan}
                    .\nSilahkan datang pada tanggal  ${req.body.tanggal}  dan waktu  ${req.body.jam_mulai}  -  ${req.body.jam_selesai}
                    .\n Untuk membatalkan reservasi klik link di bawah ini.\n https://reservasi-ruangan.vercel.app/reservasi/cancel/  ${id}`, "telp": req.body.wa_pj
            });
            let config = {
                method: 'post', maxBodyLength: Infinity, url: process.env.HOSTWA,
                headers: { 'Content-Type': 'application/json', 'Authorization': process.env.SECRET_WA }, data: data
            }; axios.request(config).then((response) => {
                console.log(JSON.stringify(response.data));
            }).catch((error) => { console.log(error); });


            return res.status(200).json({
                status: true,
                message: 'success',
                data: reservasi
            })
        } catch (err) {
            return res.status(400).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    },
    async getReservasi(req, res) {
        try {
            const reservasi = await Reservasi.findAll({
                where: {
                    status: {
                        [Op.ne]: 'deleted'
                    },
                    tanggal: {
                        [Op.gte]: new Date()
                    }
                },
                order: [['tanggal', 'ASC'], ['jam_mulai', 'ASC']],
            });
            return res.status(200).json({
                status: true,
                message: 'success',
                data: reservasi
            });
        } catch (err) {
            return res.status(400).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    }
}
