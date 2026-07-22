"use client";

import { Plus } from "lucide-react";

interface FloatingButtonProps {
  onClick: () => void;
  label: string;
}

export default function FloatingButton({
  onClick,
  label,
}: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        group
        fixed bottom-6 right-6
        z-50
        h-14
        bg-blue-800
        text-white
        rounded-full
        shadow-lg
        flex items-center
        overflow-hidden
        transition-all
        duration-300
        hover:w-56
        w-14
        hover:bg-blue-700
        cursor-pointer
      "
    >
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
        <Plus size={28} />
      </div>

      <span
        className="
          whitespace-nowrap
          opacity-0
          max-w-0
          group-hover:opacity-100
          group-hover:max-w-40
          transition-all
          duration-300
          font-medium
          text-sm
        "
      >
        {label}
      </span>
    </button>
  );
}