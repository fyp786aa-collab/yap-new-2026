import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getInternshipPreferences } from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { InternshipPrefsForm } from "@/components/forms/internship-prefs-form";

export const metadata = { title: "Internship Preferences" };

export default async function InternshipPrefsPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application) redirect(ROUTES.DASHBOARD.CONSENT);
  if (application.status === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const prefs = await getInternshipPreferences(application.id);

  const defaults =
    prefs.length > 0
      ? prefs.map((p) => ({
          agency: p.agency,
          priority_rank: p.priority_rank,
        }))
      : undefined;

  return <InternshipPrefsForm defaultValues={defaults} />;
}
