const express = require('express');
const router = express.Router();
const { getReports, exportReports } = require('../controllers/reportControllers');
const auth = require('../middleware/auth');

router.get('/', auth, getReports);
router.get('/export', auth, exportReports);

module.exports = router;