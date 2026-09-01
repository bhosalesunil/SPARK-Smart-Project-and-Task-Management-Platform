import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Calendar, ArrowLeft, Users, Tag, AlertCircle, 
  CheckCircle2, Clock, Edit2, Sparkles, FolderKanban 
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import useAuthStore from "../../context/AuthStore";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State for adding/editing cards
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [activeListId, setActiveListId] = useState(null);
  const [editingCard, setEditingCard] = useState(null);

  const [cardForm, setCardForm] = useState({
    text: "",
    priority: "normal",
    tags: "",
    assignee: "",
    dueDate: "",
  });

  useEffect(() => {
    fetchBoardAndProject();
  }, [projectId]);

  const fetchBoardAndProject = async () => {
    try {
      setLoading(true);
      const [boardRes, projectRes] = await Promise.all([
        api.get(`/board/${projectId}`),
        api.get(`/projects/${projectId}`).catch(() => ({ data: null })),
      ]);

      setLists(boardRes.data.lists || []);
      if (projectRes.data) {
        setProject(projectRes.data);
      }
    } catch (err) {
      console.error("Board Load Error:", err);
      toast.error("Failed to load project board");
    } finally {
      setLoading(false);
    }
  };

  const saveBoard = async (updatedLists) => {
    try {
      const res = await api.put(`/board/${projectId}`, { lists: updatedLists });
      if (res.data?.lists) {
        setLists(res.data.lists);
      }
    } catch (err) {
      console.error("Board Save Error:", err);
      toast.error("Failed to save board state");
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const updatedLists = lists.map((list) => ({
      ...list,
      cards: [...list.cards],
    }));

    const sourceList = updatedLists.find((l) => l._id === source.droppableId);
    const destList = updatedLists.find((l) => l._id === destination.droppableId);

    if (!sourceList || !destList) return;

    const [movedCard] = sourceList.cards.splice(source.index, 1);
    destList.cards.splice(destination.index, 0, movedCard);

    setLists(updatedLists);
    saveBoard(updatedLists);
  };

  const addList = () => {
    if (!newListName.trim()) return;

    const updated = [
      ...lists,
      { _id: `temp_${Date.now()}`, title: newListName.trim(), cards: [] },
    ];

    setLists(updated);
    setNewListName("");
    saveBoard(updated);
    toast.success(`List "${newListName.trim()}" added!`);
  };

  const deleteList = (listId, listTitle) => {
    if (!window.confirm(`Delete list "${listTitle}" and all its tasks?`)) return;
    const updated = lists.filter((list) => list._id !== listId);
    setLists(updated);
    saveBoard(updated);
    toast.success("List deleted");
  };

  const openAddCardModal = (listId) => {
    setActiveListId(listId);
    setEditingCard(null);
    setCardForm({
      text: "",
      priority: "normal",
      tags: "Frontend",
      assignee: user?.name || "",
      dueDate: "",
    });
    setIsCardModalOpen(true);
  };

  const openEditCardModal = (listId, card) => {
    setActiveListId(listId);
    setEditingCard(card);
    setCardForm({
      text: card.text || "",
      priority: card.priority || "normal",
      tags: Array.isArray(card.tags) ? card.tags.join(", ") : (card.tags || ""),
      assignee: card.assignee || "",
      dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "",
    });
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!cardForm.text.trim()) {
      toast.error("Please enter a card title");
      return;
    }

    const parsedTags = cardForm.tags
      ? cardForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    let updated;
    if (editingCard) {
      // Edit existing
      updated = lists.map((list) =>
        list._id === activeListId
          ? {
              ...list,
              cards: list.cards.map((c) =>
                c._id === editingCard._id
                  ? {
                      ...c,
                      text: cardForm.text.trim(),
                      priority: cardForm.priority,
                      tags: parsedTags,
                      assignee: cardForm.assignee.trim(),
                      dueDate: cardForm.dueDate ? new Date(cardForm.dueDate) : null,
                    }
                  : c
              ),
            }
          : list
      );
      toast.success("Card updated ✨");
    } else {
      // Create new
      const newCard = {
        _id: `temp_card_${Date.now()}`,
        text: cardForm.text.trim(),
        priority: cardForm.priority,
        tags: parsedTags,
        assignee: cardForm.assignee.trim(),
        dueDate: cardForm.dueDate ? new Date(cardForm.dueDate) : null,
      };

      updated = lists.map((list) =>
        list._id === activeListId
          ? {
              ...list,
              cards: [...list.cards, newCard],
            }
          : list
      );
      toast.success("Card added! 🚀");
    }

    setLists(updated);
    saveBoard(updated);
    setIsCardModalOpen(false);
  };

  const deleteCard = (listId, cardId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this card?")) return;

    const updated = lists.map((list) =>
      list._id === listId
        ? {
            ...list,
            cards: list.cards.filter((c) => c._id !== cardId),
          }
        : list
    );

    setLists(updated);
    saveBoard(updated);
    toast.success("Card deleted");
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <Badge variant="danger" className="text-[10px] py-0.5 px-2 h-auto uppercase tracking-wide">High</Badge>;
      case "low":
        return <Badge variant="success" className="text-[10px] py-0.5 px-2 h-auto uppercase tracking-wide">Low</Badge>;
      default:
        return <Badge variant="primary" className="text-[10px] py-0.5 px-2 h-auto uppercase tracking-wide">Normal</Badge>;
    }
  };

  const totalCardsCount = lists.reduce((acc, l) => acc + (l.cards?.length || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-1/3 rounded-xl" />
        <div className="flex gap-6 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-80 h-[500px] shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 glass-panel p-4 sm:p-6 rounded-2xl border border-white/5">
        <div>
          <button
            onClick={() => navigate(user?.role === "admin" ? "/admin/projects" : "/member")}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-1.5"
          >
            <ArrowLeft size={14} /> Back to {user?.role === "admin" ? "Projects" : "Dashboard"}
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FolderKanban className="text-primary-400" size={24} />
              {project?.name || "Project Kanban Board"}
            </h1>
            <Badge variant="primary" className="text-xs px-2.5 py-0.5">
              {totalCardsCount} {totalCardsCount === 1 ? "Card" : "Cards"}
            </Badge>
          </div>
          {project?.description && (
            <p className="text-zinc-400 text-sm mt-1 line-clamp-1">{project.description}</p>
          )}
        </div>

        {user?.role === "admin" && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${projectId}/members`)}
              className="gap-1.5 text-xs"
            >
              <Users size={14} /> Team Members ({project?.members?.length || 0})
            </Button>
          </div>
        )}
      </div>

      {/* Kanban Drag and Drop Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start custom-scrollbar">
          {lists.map((list) => (
            <div
              key={list._id}
              className="w-[320px] shrink-0 flex flex-col glass-panel rounded-2xl border border-white/5 max-h-full shadow-lg"
            >
              {/* Column Header */}
              <div className="p-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white tracking-tight">{list.title}</h2>
                  <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-medium">
                    {list.cards.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openAddCardModal(list._id)}
                    title="Add task"
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => deleteList(list._id, list.title)}
                    title="Delete list"
                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Cards Droppable Zone */}
              <Droppable droppableId={list._id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 space-y-3 overflow-y-auto min-h-[140px] max-h-[calc(100vh-20rem)] transition-colors duration-200 ${
                      snapshot.isDraggingOver ? "bg-primary-500/10 rounded-xl" : ""
                    }`}
                  >
                    {list.cards.map((card, index) => (
                      <Draggable key={card._id} draggableId={card._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => openEditCardModal(list._id, card)}
                            style={{ ...provided.draggableProps.style }}
                            className={`group relative bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 rounded-xl p-3.5 shadow-md flex flex-col gap-2.5 transition-all cursor-pointer ${
                              snapshot.isDragging
                                ? "shadow-2xl shadow-primary-500/30 ring-2 ring-primary-500 scale-[1.03] z-50 bg-zinc-800"
                                : "hover:border-primary-500/40 hover:shadow-lg"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {getPriorityBadge(card.priority || "normal")}
                                {Array.isArray(card.tags) &&
                                  card.tags.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => deleteCard(list._id, card._id, e)}
                                  title="Delete card"
                                  className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <p className="text-sm font-medium text-zinc-100 leading-snug break-words">
                              {card.text}
                            </p>

                            <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-white/5 text-xs text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-zinc-500" />
                                <span className={card.dueDate && new Date(card.dueDate) < new Date() ? "text-red-400 font-medium" : "text-zinc-400"}>
                                  {card.dueDate ? new Date(card.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No date"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary-600 to-accent-600 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                  {card.assignee ? card.assignee.charAt(0).toUpperCase() : "U"}
                                </div>
                                <span className="text-[11px] text-zinc-400 max-w-[80px] truncate">
                                  {card.assignee || "Unassigned"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add Card Button */}
              <div className="p-3 border-t border-white/5">
                <Button
                  variant="ghost"
                  className="w-full text-zinc-400 hover:text-white hover:bg-white/5 border border-dashed border-zinc-700/60 h-9 text-xs rounded-xl"
                  onClick={() => openAddCardModal(list._id)}
                >
                  <Plus size={14} className="mr-1.5" /> Add Task Card
                </Button>
              </div>
            </div>
          ))}

          {/* New List Column */}
          <div className="w-[300px] shrink-0 glass-panel rounded-2xl border border-white/5 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Add Another List</h3>
            <div className="flex gap-2">
              <Input
                placeholder="List name (e.g. In Review)..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addList()}
                className="bg-zinc-900/60 text-sm py-2"
              />
              <Button onClick={addList} size="sm" className="px-3 shrink-0">
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Card Creation / Edit Modal */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title={editingCard ? "Edit Task Card" : "Create Task Card"}
      >
        <form onSubmit={handleSaveCard} className="space-y-4">
          <Input
            label="Task Title / Content"
            placeholder="e.g. Implement user login API endpoints"
            value={cardForm.text}
            onChange={(e) => setCardForm({ ...cardForm, text: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Priority</label>
              <select
                value={cardForm.priority}
                onChange={(e) => setCardForm({ ...cardForm, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              >
                <option value="low">🟢 Low</option>
                <option value="normal">🔵 Normal</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Assignee</label>
              <input
                type="text"
                placeholder="Name of assignee"
                value={cardForm.assignee}
                onChange={(e) => setCardForm({ ...cardForm, assignee: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Frontend, Bug, UI"
                value={cardForm.tags}
                onChange={(e) => setCardForm({ ...cardForm, tags: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Due Date</label>
              <input
                type="date"
                value={cardForm.dueDate}
                onChange={(e) => setCardForm({ ...cardForm, dueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsCardModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 shadow-lg shadow-primary-500/20">
              {editingCard ? "Save Changes" : "Add Card"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
