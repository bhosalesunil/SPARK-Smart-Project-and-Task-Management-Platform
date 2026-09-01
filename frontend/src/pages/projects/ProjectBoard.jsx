import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { 
  Plus, MoreHorizontal, Users, ArrowLeft, Trash2, Edit2, 
  Calendar, Tag, User, CheckCircle2, ChevronRight, X
} from "lucide-react";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import useAuthStore from "../../context/AuthStore";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [board, setBoard] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State for Adding/Editing Cards
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalListIndex, setModalListIndex] = useState(0);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  // Form Fields for Card
  const [cardTitle, setCardTitle] = useState("");
  const [cardPriority, setCardPriority] = useState("medium");
  const [cardAssignee, setCardAssignee] = useState("");
  const [cardTags, setCardTags] = useState("");
  const [cardDueDate, setCardDueDate] = useState("");

  useEffect(() => {
    fetchBoardAndProject();
  }, [projectId]);

  const fetchBoardAndProject = async () => {
    try {
      setLoading(true);
      const [boardRes, projRes] = await Promise.all([
        api.get(`/boards/${projectId}`),
        api.get(`/projects/${projectId}`),
      ]);

      setBoard(boardRes.data);
      setProject(projRes.data);
    } catch (err) {
      toast.error("Failed to load board");
      console.error("Board Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddCardModal = (listIndex) => {
    setModalListIndex(listIndex);
    setEditingCardIndex(null);
    setCardTitle("");
    setCardPriority("medium");
    setCardAssignee(user?.name || "John");
    setCardTags("");
    setCardDueDate("");
    setIsModalOpen(true);
  };

  const openEditCardModal = (listIndex, cardIndex, card) => {
    setModalListIndex(listIndex);
    setEditingCardIndex(cardIndex);
    setCardTitle(card.text || "");
    setCardPriority(card.priority || "medium");
    setCardAssignee(card.assignee || "");
    setCardTags(card.tags?.join(", ") || "");
    setCardDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "");
    setIsModalOpen(true);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) {
      toast.error("Card title is required");
      return;
    }

    const updatedLists = [...board.lists];
    const tagsArray = cardTags
      ? cardTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const newCard = {
      text: cardTitle.trim(),
      priority: cardPriority,
      assignee: cardAssignee.trim() || user?.name || "Member",
      tags: tagsArray,
      dueDate: cardDueDate ? new Date(cardDueDate) : null,
    };

    if (editingCardIndex !== null) {
      updatedLists[modalListIndex].cards[editingCardIndex] = newCard;
    } else {
      updatedLists[modalListIndex].cards.push(newCard);
    }

    setBoard({ ...board, lists: updatedLists });
    setIsModalOpen(false);

    try {
      await api.put(`/boards/${projectId}`, { lists: updatedLists });
      toast.success(editingCardIndex !== null ? "Card updated" : "Card added");
    } catch {
      toast.error("Failed to save card");
      fetchBoardAndProject();
    }
  };

  const handleDeleteCard = async (listIndex, cardIndex, e) => {
    e.stopPropagation();
    const updatedLists = [...board.lists];
    updatedLists[listIndex].cards.splice(cardIndex, 1);
    setBoard({ ...board, lists: updatedLists });

    try {
      await api.put(`/boards/${projectId}`, { lists: updatedLists });
      toast.success("Card removed");
    } catch {
      toast.error("Failed to delete card");
      fetchBoardAndProject();
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceListIndex = parseInt(source.droppableId);
    const destListIndex = parseInt(destination.droppableId);

    const updatedLists = [...board.lists];
    const [movedCard] = updatedLists[sourceListIndex].cards.splice(source.index, 1);
    updatedLists[destListIndex].cards.splice(destination.index, 0, movedCard);

    setBoard({ ...board, lists: updatedLists });

    try {
      setIsSaving(true);
      await api.put(`/boards/${projectId}`, { lists: updatedLists });
    } catch {
      toast.error("Failed to update board");
      fetchBoardAndProject();
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">High</span>;
      case "medium":
      case "normal":
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Medium</span>;
      case "low":
      default:
        return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Low</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl bg-slate-800/50" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header matching mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Link to="/admin/projects" className="hover:text-white transition-colors">Boards</Link>
            <ChevronRight size={13} className="text-slate-600" />
            <span className="text-slate-200 font-medium">{project?.name || "Workspace"}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight font-heading">
              {project?.name || "Project Board"}
            </h1>
            <button className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800/60">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}/members`)}
            className="text-xs gap-1.5"
          >
            <Users size={14} /> Team ({project?.members?.length || 1})
          </Button>

          <Button
            size="sm"
            onClick={() => openAddCardModal(0)}
            className="text-xs gap-1.5 px-4 shadow-lg shadow-emerald-600/20"
          >
            <Plus size={15} /> Add Task
          </Button>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {board?.lists?.map((list, listIndex) => (
            <div
              key={listIndex}
              className="bg-[#0f172a] border border-slate-800/90 rounded-2xl p-4 flex flex-col max-h-[calc(100vh-210px)] shadow-lg shadow-black/20"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-white tracking-tight font-heading">
                    {list.title}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full border border-slate-700/60">
                    {list.cards?.length || 0}
                  </span>
                </div>

                <button
                  onClick={() => openAddCardModal(listIndex)}
                  className="p-1 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800/60 transition-colors"
                  title="Add card"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Card List Droppable */}
              <Droppable droppableId={`${listIndex}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto space-y-3 min-h-[140px] pr-1 transition-colors rounded-xl ${
                      snapshot.isDraggingOver ? "bg-slate-800/20" : ""
                    }`}
                  >
                    {list.cards?.map((card, cardIndex) => (
                      <Draggable
                        key={`${listIndex}-${cardIndex}`}
                        draggableId={`${listIndex}-${cardIndex}`}
                        index={cardIndex}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => openEditCardModal(listIndex, cardIndex, card)}
                            className={`bg-[#131d31] hover:bg-[#18243d] border border-slate-800/90 hover:border-slate-700/90 rounded-xl p-3.5 transition-all cursor-pointer group shadow-sm ${
                              snapshot.isDragging
                                ? "shadow-2xl ring-2 ring-emerald-500/50 rotate-1 scale-102 bg-[#18243d]"
                                : ""
                            }`}
                          >
                            {/* Card Header: Priority & Assignee avatar */}
                            <div className="flex items-center justify-between mb-2">
                              {getPriorityBadge(card.priority)}

                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                  {card.assignee ? card.assignee.charAt(0).toUpperCase() : "U"}
                                </div>
                                <span className="text-[11px] text-slate-300">
                                  {card.assignee || "Assignee"}
                                </span>
                              </div>
                            </div>

                            {/* Task Title */}
                            <p className="text-sm font-semibold text-white leading-snug">
                              {card.text}
                            </p>

                            {/* Tags or Due Date */}
                            {(card.tags?.length > 0 || card.dueDate) && (
                              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                                {card.tags?.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {card.dueDate && (
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <Calendar size={11} /> {new Date(card.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Action Buttons on Hover */}
                            <div className="flex justify-end gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleDeleteCard(listIndex, cardIndex, e)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Bottom "+ Add Task" button in column */}
              <button
                onClick={() => openAddCardModal(listIndex)}
                className="w-full mt-3 py-2 text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-800/40 rounded-xl border border-dashed border-slate-800 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add Task
              </button>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Add / Edit Card Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCardIndex !== null ? "Edit Task Card" : "Add Task Card"}
      >
        <form onSubmit={handleSaveCard} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g. Create wireframes"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
                Priority
              </label>
              <select
                value={cardPriority}
                onChange={(e) => setCardPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-xs"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
                Assignee
              </label>
              <input
                type="text"
                placeholder="e.g. John"
                value={cardAssignee}
                onChange={(e) => setCardAssignee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Design, Frontend"
                value={cardTags}
                onChange={(e) => setCardTags(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">
                Due Date
              </label>
              <input
                type="date"
                value={cardDueDate}
                onChange={(e) => setCardDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#131d31] border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-xs"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 shadow-lg shadow-emerald-600/20"
            >
              {editingCardIndex !== null ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
