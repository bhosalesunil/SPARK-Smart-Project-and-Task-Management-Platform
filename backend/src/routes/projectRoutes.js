const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectMembers,
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(authenticate);

// All authenticated users can list and view projects
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Admin-only mutations
router.post('/', requireAdmin, createProject);
router.put('/:id', requireAdmin, updateProject);
router.delete('/:id', requireAdmin, deleteProject);
router.post('/:id/members', requireAdmin, updateProjectMembers);

module.exports = router;
