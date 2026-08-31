const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, getAvailableMembers } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(authenticate);

// Admin endpoints
router.get('/', requireAdmin, getUsers);
router.patch('/:id/role', requireAdmin, updateUserRole);

// Endpoint for picking members for tasks and projects
router.get('/members', getAvailableMembers);

module.exports = router;
