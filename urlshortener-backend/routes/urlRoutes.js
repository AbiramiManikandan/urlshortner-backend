const express = require('express');
const { createShortURL, redirectToLongURL } = require('../controllers/urlController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createShortURL);
router.get('/:shortUrl', redirectToLongURL);

module.exports = router;
