import express from "express";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

console.log("User routes loaded");

//  GET ALL USERS
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

//  GET PENDING USERS
router.get("/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({ status: "pending" }).select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
});

// APPROVE USER
router.put("/:id/approve", protect, authorize("admin"), async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(403).json({ message: "You cannot approve your own account" });
    }

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "approved";
    if (req.body?.role && ["admin", "member"].includes(req.body.role)) {
      user.role = req.body.role;
    }
    await user.save();

    if (req.body?.projectId) {
      const project = await Project.findById(req.body.projectId);
      if (project && !project.members.includes(user._id)) {
        project.members.push(user._id);
        await project.save();
      }
    }

    res.json({ message: "User approved successfully", user: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    console.error("Approval Error:", err);
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
});

// PROMOTE TO ADMIN
router.put("/:id/promote-admin", protect, authorize("admin"), async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(403).json({ message: "You cannot promote your own account" });
    }

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    user.status = "approved"; // automatically approve if promoted
    await user.save();

    res.json({ message: "User promoted to Admin successfully" });
  } catch {
    res.status(500).json({ message: "Promotion failed" });
  }
});

//  REJECT USER
router.delete("/:id/reject", protect, authorize("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Project.updateMany({}, { $pull: { members: req.params.id } });
    await Task.updateMany({ assignedTo: req.params.id }, { $set: { assignedTo: null } });
    res.json({ message: "User rejected & removed" });
  } catch {
    res.status(500).json({ message: "Rejection failed" });
  }
});

export default router;
