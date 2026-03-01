"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SECTION_ORDER } from "@/lib/routes";

interface SectionWrapperProps {
  sectionKey: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SectionWrapper({
  sectionKey,
  title,
  description,
  children,
}: SectionWrapperProps) {
  const currentIndex = SECTION_ORDER.findIndex((s) => s.key === sectionKey);
  const currentSection = SECTION_ORDER[currentIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-yap-accent/10 flex items-center justify-center">
          <span className="text-sm font-bold text-yap-accent">
            {currentSection?.section || ""}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-yap-primary">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Form content */}
      <Card>
        <CardContent className="pt-6 pb-6">{children}</CardContent>
      </Card>
    </div>
  );
}
