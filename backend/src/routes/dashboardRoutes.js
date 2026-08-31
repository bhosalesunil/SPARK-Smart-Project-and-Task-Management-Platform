const express = require('express');
const router = express.Router();
const { getAdminDashboard, getMemberDashboard } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/admin', requireAdmin, getAdminDashboard);
router.get('/member', getMemberDashboard);

module.exports = router;
