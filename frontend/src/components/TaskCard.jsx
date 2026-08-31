import React from 'react';
import { Folder, Calendar, Clock, Trash2, Edit3, ChevronDown } from 'lucide-react';

export const TaskCard = ({
  task,
  isMemberView = false,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'TODO':
      default:
        return 'bg-slate-700/30 text-slate-300 border border-slate-700/50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'TODO':
      default:
        return 'To Do';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'LOW':
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="bg-[#121622] border border-[#1E2436] hover:border-slate-700/70 transition-all rounded-xl p-5 shadow-sm">
      {/* Top Header: Title & Status Badge */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h4 className="text-base font-semibold text-white hover:text-primary transition-colors">
            {task.title}
          </h4>
          <span className={`spark-badge text-xs px-2.5 py-0.5 ${getStatusBadge(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
          {task.priority && (
            <span className={`spark-badge text-[11px] border px-2 py-0.5 font-semibold ${getPriorityBadge(task.priority)}`}>
              {task.priority}
            </span>
          )}
        </div>

        {/* Action icons for Admin */}
        {!isMemberView && (
          <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2436] transition-colors"
                title="Edit Task"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id || task._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description if present */}
      {task.description && (
        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      )}

      {/* Metadata Row */}
      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap mb-4">
        {task.assignedTo && (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </span>
            <span className="text-slate-300 font-medium">{task.assignedTo.name}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-slate-400">
          <Folder className="w-3.5 h-3.5 text-slate-500" />
          <span>Project: <strong className="text-slate-300 font-normal">{task.project?.name || 'Unassigned'}</strong></span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Status Transition dropdown for Member (as shown in screenshot) */}
      {isMemberView && (
        <div className="pt-3 border-t border-[#1E2436]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Update Status
          </span>
          <div className="relative">
            <select
              value={task.status}
              onChange={(e) => onStatusChange && onStatusChange(task.id || task._id, e.target.value)}
              className="bg-[#0E111A] border border-[#1E2436] focus:border-primary text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none cursor-pointer pr-8 appearance-none"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};
