"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { ROUTES, SECTION_ORDER } from "@/lib/routes";
import type { SectionCompletion, ApplicationStatus } from "@/types";
import {
  GraduationCap,
  Home,
  FileCheck,
  CheckCircle2,
  Circle,
  Send,
  Lock,
} from "lucide-react";

const COMPLETION_KEY_MAP: Record<string, keyof SectionCompletion> = {
  "personal-info": "personalInfo",
  academic: "academic",
  placement: "placement",
  "internship-prefs": "internshipPrefs",
  skills: "skills",
  experience: "experience",
  motivation: "motivation",
  availability: "availability",
  documents: "documents",
  video: "video",
};

interface AppSidebarProps {
  userEmail: string;
  completion: SectionCompletion;
  applicationStatus: ApplicationStatus;
  consentGiven: boolean;
}

export function AppSidebar({
  completion,
  applicationStatus,
  consentGiven,
}: AppSidebarProps) {
  const pathname = usePathname();
  const isSubmitted = applicationStatus === "Submitted";
  const isLocked = !consentGiven || isSubmitted;

  const completedCount = Object.values(completion).filter(Boolean).length;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="bg-yap-primary px-4 py-5">
        <Link href={ROUTES.DASHBOARD.HOME} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yap-accent flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">YAP 2026</p>
            <p className="text-[11px] text-white/50">Application Portal</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-yap-primary">
        {/* Dashboard link */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === ROUTES.DASHBOARD.HOME}
                className="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white"
              >
                <Link href={ROUTES.DASHBOARD.HOME}>
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Form Sections */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-[11px] uppercase tracking-wider px-4">
            Application Sections
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SECTION_ORDER.map((section) => {
                const completionKey = COMPLETION_KEY_MAP[section.key];
                const isComplete = completionKey
                  ? completion[completionKey]
                  : false;
                const isActive = pathname === section.route;

                return (
                  <SidebarMenuItem key={section.key}>
                    <SidebarMenuButton
                      asChild={!isLocked}
                      isActive={isActive}
                      className={`text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isLocked ? (
                        <span className="flex items-center gap-3 w-full">
                          <Lock className="w-4 h-4 text-white/30 shrink-0" />
                          <span className="text-sm truncate">
                            {section.section}. {section.label}
                          </span>
                        </span>
                      ) : (
                        <Link href={section.route}>
                          <span className="flex items-center gap-3 w-full">
                            {isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-yap-accent shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-white/30 shrink-0" />
                            )}
                            <span className="text-sm truncate">
                              {section.section}. {section.label}
                            </span>
                          </span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Review & Submit */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild={!isLocked}
                isActive={pathname === ROUTES.DASHBOARD.REVIEW}
                className={`text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLocked ? (
                  <span>
                    <Lock className="w-4 h-4 text-white/30" />
                    <span>Review & Submit</span>
                  </span>
                ) : (
                  <Link href={ROUTES.DASHBOARD.REVIEW}>
                    <Send className="w-4 h-4" />
                    <span>Review & Submit</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-yap-primary px-4 py-4">
        <div className="flex items-center gap-2 text-white/50 text-xs">
          <FileCheck className="w-4 h-4 shrink-0" />
          <span>{completedCount} of 10 sections complete</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
          <div
            className="bg-yap-accent h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 10) * 100}%` }}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
