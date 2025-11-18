const path = require('path');
const { Reservasi } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');
const { isTimeOverlap } = require('../helper/index.js')
module.exports = {
    async fomrReservasi(req, res) {
        try {
            return res.sendFile(path.join(__dirname, './../views/', 'index.html'));

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
            //validasi selsisih
            let findAllBooking = await Reservasi.findAll({
                where: {
                    status: {
                        [Op.ne]: 'deleted'
                    },
                    tanggal: {
                        [Op.eq]: req.body.tanggal
                    },
                    ruangan: {
                        [Op.eq]: req.body.ruangan
                    }
                }
            })
            if (findAllBooking.length > 0) {
                for (let x of findAllBooking) {
                    let check = isTimeOverlap(req.body.jam_mulai, req.body.jam_selesai, x.jam_mulai, x.jam_selesai)
                    console.log(check)
                    if (check) {
                        return res.status(400).json({
                            status: false,
                            message: 'Ruangan tidak tersedia, ada kegiatan ' + x.nama_pertemuan,
                            data: `Jam booking berikut telah terbooking: ${x.jam_mulai} - ${x.jam_selesai} `
                        });
                    }
                }
            }
            let restID = await Reservasi.create(req.body);
            let random = Math.floor(Math.random() * 10000)
            let random2 = Math.floor(Math.random() * 10000)
            let id = random2 + ':' + restID.id + ':' + random
            id = Buffer.from(id).toString('base64');

            let data = JSON.stringify({
                "message":
                    `Terimakasih atas reservasi anda di ruangan ${req.body.ruangan}
                    .\nSilahkan datang pada tanggal  ${req.body.tanggal}  dan waktu  ${req.body.jam_mulai}  -  ${req.body.jam_selesai}
                    .\n Untuk membatalkan reservasi klik link di bawah ini.\n https://rsudaa.singkawangkota.go.id/reservasi/cancel/${id}`, "telp": req.body.wa_pj
            });
            let config = {
                method: 'post', maxBodyLength: Infinity, url: process.env.HOSTWA,
                headers: { 'Content-Type': 'application/json', 'Authorization': process.env.SECRET_WA }, data: data
            }; axios.request(config).then((response) => {
                console.log(JSON.stringify(response.data));
            }).catch((error) => { console.log(error); });

            let data2 = JSON.stringify({
                "message":
                    `Terimakasih atas reservasi anda di ruangan ${req.body.ruangan}
                    .\nSilahkan datang pada tanggal  ${req.body.tanggal}  dan waktu  ${req.body.jam_mulai}  -  ${req.body.jam_selesai}
                    .\n Untuk membatalkan reservasi klik link di bawah ini.\n https://rsudaa.singkawangkota.go.id/reservasi/cancel/${id}`, "telp": process.env.WA_ADMIN
            });
            let config2 = {
                method: 'post', maxBodyLength: Infinity, url: process.env.HOSTWA,
                headers: { 'Content-Type': 'application/json', 'Authorization': process.env.SECRET_WA }, data: data2
            }; axios.request(config2).then((response) => {
                console.log(JSON.stringify(response.data));
            }).catch((error) => { console.log(error); });

            return res.status(200).json({
                status: true,
                message: 'success',
                data: restID
            })
        } catch (err) {
            console.log(err)
            return res.status(400).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    },
    async getReservasi(req, res) {
        try {
            const dataReservasi = await Reservasi.findAll({
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
                data: dataReservasi
            });
        } catch (err) {
            return res.status(400).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    },
    async cancel(req, res) {
        try {
            console.log(req.params.id)
            // let dataID = Buffer.from(req.params.id, 'base64').toString('utf8').split(':');
            // console.log(dataID[1])
            // let del = await Reservasi.update(
            //     { 'status': 'deleted' }, {
            //     where: {
            //         id: dataID[1]
            //     }
            // })
            // console.log(del)

            res.cookie('status', req.params.id, { maxAge: 900000 });

            return res.redirect('/reservasi/ruangan')
        }
        catch (err) {
            console.log(err)
            return res.status(400).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    },
    async cancelPush(req, res) {
        try {
            console.log(req.params.id)
            let dataID = Buffer.from(req.params.id, 'base64').toString('utf8').split(':');
            console.log(dataID[1])
            let del = await Reservasi.update(
                { 'status': 'deleted' }, {
                where: {
                    id: dataID[1]
                }
            })
            console.log(del)
            return res.status(200).json({
                status: false,
                message: 'success',
                data: null
            });
            // res.cookie('status', req.params.id, { maxAge: 900000 });
            // return res.redirect('/reservasi/ruangan')
        }
        catch (err) {
            console.log(err)
            return res.status(400).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    }
}
