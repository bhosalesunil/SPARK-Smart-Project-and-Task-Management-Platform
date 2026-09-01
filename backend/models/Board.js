import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  text: { type: String, required: true },
  priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
  tags: [{ type: String }],
  dueDate: { type: Date, default: null },
  assignee: { type: String, default: null },
});

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cards: [cardSchema],
});

const boardSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },
    lists: [listSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Board", boardSchema);
