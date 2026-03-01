"use client";

import { useState, useRef, useCallback } from "react";
import { GripVertical } from "lucide-react";
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const touchItemIndex = useRef<number | null>(null);

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const newItems = [...items];
      const [moved] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, moved);
      onChange(newItems.map((item, i) => ({ ...item, priority_rank: i + 1 })));
    },
    [items, onChange],
  );

  const reset = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  // --- HTML5 Drag & Drop (desktop) ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null) {
      reorder(dragIndex, dropIndex);
    }
    reset();
  };

  const handleDragEnd = () => reset();

  // --- Touch handling for mobile ---
  const getItemIndexAtY = useCallback((clientY: number): number | null => {
    if (!listRef.current) return null;
    const children = Array.from(listRef.current.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) return i;
    }
    return null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    touchItemIndex.current = index;
    setDragIndex(index);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const targetIndex = getItemIndexAtY(e.touches[0].clientY);
      if (targetIndex !== null) setOverIndex(targetIndex);
    },
    [getItemIndexAtY],
  );

  const handleTouchEnd = useCallback(() => {
    if (touchItemIndex.current !== null && overIndex !== null) {
      reorder(touchItemIndex.current, overIndex);
    }
    touchItemIndex.current = null;
    reset();
  }, [overIndex, reorder]);

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">
        Drag and drop to rank agencies from highest (1) to lowest (6) priority
      </p>
      <div className="space-y-2" ref={listRef}>
        {items.map((item, index) => (
          <div
            key={item.agency}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onDragLeave={() => overIndex === index && setOverIndex(null)}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={(e) => handleTouchMove(e)}
            onTouchEnd={handleTouchEnd}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white transition-all duration-200 select-none touch-none",
              "hover:shadow-md hover:border-[#82a845]/30",
              "cursor-grab active:cursor-grabbing",
              index === 0 &&
                dragIndex === null &&
                "border-[#82a845] bg-green-50/50",
              dragIndex === index &&
                "opacity-50 scale-[0.98] shadow-lg border-[#82a845]",
              overIndex === index &&
                dragIndex !== index &&
                "border-[#82a845] border-2 bg-green-50/30",
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#152232] text-white text-sm font-bold shrink-0">
              {item.priority_rank}
            </div>
            <GripVertical className="h-5 w-5 text-gray-400 shrink-0" />
            <span className="flex-1 text-sm font-medium text-[#152232]">
              {item.agency}
            </span>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-[#dc2626] text-sm mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
