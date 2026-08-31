import React from 'react';
import { Users, Calendar, ArrowRight, Settings, Trash2 } from 'lucide-react';
import { Button } from './Button';

export const ProjectCard = ({
  project,
  onManageTeam,
  onViewBoard,
  onDelete,
}) => {
  const memberCount = project._count?.members ?? project.members?.length ?? 0;
  const createdDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString()
    : 'Recently';

  return (
    <div className="bg-[#121622] border border-[#1E2436] hover:border-slate-700/70 transition-all rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Title and Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-base font-semibold text-white tracking-wide">
            {project.name}
          </h4>
          <span className="spark-badge text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            {project.status === 'ACTIVE' ? 'Active' : project.status}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{memberCount} Members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{createdDate}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#1E2436]/60">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onManageTeam(project)}
          className="flex-1 text-xs"
        >
          Manage Team
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onViewBoard(project)}
          className="flex-1 text-xs gap-1"
        >
          <span>View Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        {onDelete && (
          <button
            onClick={() => onDelete(project.id || project._id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
