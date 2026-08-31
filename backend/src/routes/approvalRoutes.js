const express = require('express');
const router = express.Router();
const { getPendingApprovals, approveUser, rejectUser } = require('../controllers/approvalController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(authenticate, requireAdmin);

router.get('/', getPendingApprovals);
router.patch('/:id/approve', approveUser);
router.patch('/:id/reject', rejectUser);

module.exports = router;
