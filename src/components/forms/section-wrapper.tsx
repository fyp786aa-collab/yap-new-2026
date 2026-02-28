"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SECTION_ORDER, ROUTES } from "@/lib/routes";

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
  const router = useRouter();
  const currentIndex = SECTION_ORDER.findIndex((s) => s.key === sectionKey);
  const prevSection = currentIndex > 0 ? SECTION_ORDER[currentIndex - 1] : null;
  const nextSection =
    currentIndex < SECTION_ORDER.length - 1
      ? SECTION_ORDER[currentIndex + 1]
      : null;
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

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        {prevSection ? (
          <ButtonPrimary
            variant="outline"
            onClick={() => router.push(prevSection.route)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {prevSection.label}
          </ButtonPrimary>
        ) : (
          <ButtonPrimary
            variant="outline"
            onClick={() => router.push(ROUTES.DASHBOARD.HOME)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </ButtonPrimary>
        )}

        {nextSection ? (
          <ButtonPrimary
            variant="ghost"
            onClick={() => router.push(nextSection.route)}
          >
            {nextSection.label}
            <ArrowRight className="w-4 h-4 ml-2" />
          </ButtonPrimary>
        ) : (
          <ButtonPrimary
            variant="ghost"
            onClick={() => router.push(ROUTES.DASHBOARD.REVIEW)}
          >
            Review & Submit
            <ArrowRight className="w-4 h-4 ml-2" />
          </ButtonPrimary>
        )}
      </div>
    </div>
  );
}
