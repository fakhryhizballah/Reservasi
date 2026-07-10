const express = require('express');
const router = express.Router();

const webviews = require('../controllers/webviews');
router.get('/ruangan', webviews.fomrReservasi);
router.get('/ruangan/moderator', webviews.adminReservasi);
router.get('/tv', webviews.tvReservasi);
router.get('/kamar', webviews.kamar);
router.get('/cancel/:id', webviews.cancel);
router.post('/cancel/:id', webviews.cancelPush);
router.patch('/cancel/:id', webviews.cancelReservasi);
router.post('/reservasi', webviews.postReservasi);
router.get('/reservasi', webviews.getReservasi);
// router.get('/short', links.short);

module.exports = router;