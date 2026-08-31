const express = require('express');
const router = express.Router();
const {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(authenticate);

// Member dedicated endpoint
router.get('/my-tasks', getMyTasks);

// General tasks endpoint
router.get('/', getTasks);
router.get('/:id', getTaskById);

// Task status update (Members can update their assigned tasks, Admin can update any)
router.patch('/:id/status', updateTaskStatus);

// Admin-only endpoints
router.post('/', requireAdmin, createTask);
router.put('/:id', requireAdmin, updateTask);
router.delete('/:id', requireAdmin, deleteTask);

module.exports = router;
