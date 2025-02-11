const express = require('express');
const router = express.Router();

const webviews = require('../controllers/webviews');
router.get('/reservasi', webviews.fomrReservasi);
router.post('/reservasi', webviews.postReservasi);
// router.get('/short', links.short);

module.exports = router;