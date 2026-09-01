import express from "express";
import Project from "../models/Project.js";
import Board from "../models/Board.js";
import Task from "../models/Task.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

console.log("Project routes loaded");

// GET ALL PROJECTS
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// GET SINGLE PROJECT
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Single Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE PROJECT
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name required" });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      createdBy: req.user.id,
      status: status || "active",
      members: [req.user.id],
    });

    // Initialize board immediately
    await Board.create({
      projectId: project._id,
      lists: [
        { title: "To Do", cards: [] },
        { title: "In Progress", cards: [] },
        { title: "Completed", cards: [] },
      ],
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// DELETE PROJECT
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Cascade delete associated boards and tasks
    await Board.deleteMany({ projectId: req.params.id });
    await Task.deleteMany({ project: req.params.id });

    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

// ADD MEMBER (support both POST and PUT)
const addMemberHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "User already a member" });
    }

    project.members.push(userId);
    await project.save();

    res.json({ message: "Member added", project });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ message: "Failed to add member" });
  }
};

router.post("/:id/members", protect, authorize("admin"), addMemberHandler);
router.put("/:id/members", protect, authorize("admin"), addMemberHandler);

// REMOVE MEMBER
router.delete("/:id/members/:userId", protect, authorize("admin"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );

    await project.save();

    res.json({ message: "Member removed" });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ message: "Failed to remove member" });
  }
});

export default router;
