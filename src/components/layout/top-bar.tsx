"use client";

import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { APPLICATION_DEADLINE } from "@/lib/constants";
import { CalendarClock, LogOut, User } from "lucide-react";
import type { ApplicationStatus } from "@/types";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Draft: "bg-amber-100 text-amber-700 border-amber-200",
  Submitted: "bg-yap-accent/10 text-yap-accent border-yap-accent/20",
  "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
  Shortlisted: "bg-purple-100 text-purple-700 border-purple-200",
  Selected: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

interface TopBarProps {
  userEmail: string;
  applicationStatus: ApplicationStatus;
}

export function TopBar({ userEmail, applicationStatus }: TopBarProps) {
  return (
    <header className="border-b bg-white px-4 py-2">
      <div className="flex min-h-10 items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <Badge
            variant="outline"
            className={`text-xs font-medium ${STATUS_COLORS[applicationStatus]}`}
          >
            {applicationStatus}
          </Badge>
          <div className="hidden sm:flex animate-pulse-gentle items-center rounded-full border border-rose-200 bg-linear-to-r from-amber-100 via-orange-100 to-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 shadow-sm">
            <span className="mr-1.5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-white uppercase">
              Closing soon
            </span>
            <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
            <span>{APPLICATION_DEADLINE}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="max-w-45 truncate">{userEmail}</span>
          </div>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <ButtonPrimary
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Logout</span>
          </ButtonPrimary>
        </div>
      </div>

      <div className="mt-2 flex justify-center sm:hidden">
        <div className="inline-flex animate-pulse-gentle items-center rounded-full border border-rose-200 bg-linear-to-r from-amber-100 via-orange-100 to-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 shadow-sm">
          <span className="mr-1.5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-white uppercase">
            Closing soon
          </span>
          <CalendarClock className="mr-1 h-3.5 w-3.5" />
          <span className="whitespace-nowrap">{APPLICATION_DEADLINE}</span>
        </div>
      </div>
    </header>
  );
}
