const express = require('express');
const router = express.Router();

const webviews = require('../controllers/webviews');
router.get('/ruangan', webviews.fomrReservasi);
router.post('/reservasi', webviews.postReservasi);
router.get('/reservasi', webviews.getReservasi);
// router.get('/short', links.short);

module.exports = router;