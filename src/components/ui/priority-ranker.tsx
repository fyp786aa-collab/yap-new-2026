"use client";

import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityRankerProps {
  items: Array<{ agency: string; priority_rank: number }>;
  onChange: (items: Array<{ agency: string; priority_rank: number }>) => void;
  error?: string;
}

export function PriorityRanker({
  items,
  onChange,
  error,
}: PriorityRankerProps) {
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];
    onChange(newItems.map((item, i) => ({ ...item, priority_rank: i + 1 })));
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    onChange(newItems.map((item, i) => ({ ...item, priority_rank: i + 1 })));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">
        Rank agencies from highest (1) to lowest (6) priority using the arrows
      </p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.agency}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white transition-all duration-200",
              "hover:shadow-md hover:border-[#82a845]/30",
              index === 0 && "border-[#82a845] bg-green-50/50",
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#152232] text-white text-sm font-bold shrink-0">
              {item.priority_rank}
            </div>
            <GripVertical className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="flex-1 text-sm font-medium text-[#152232]">
              {item.agency}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowUp className="h-4 w-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowDown className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-[#dc2626] text-sm mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
