import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORT_EMAIL, APP_NAME } from "@/lib/constants";
import { CheckCircle2, Mail, Calendar, FileCheck } from "lucide-react";

export const metadata = { title: "Application Submitted" };

export default async function SubmittedPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);

  if (!application || application.status !== "Submitted") {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-8 space-y-8 animate-fade-in">
      {/* Success animation */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-yap-accent/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-yap-accent animate-scale-in" />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-yap-primary">
          Application Submitted!
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Thank you for applying to the {APP_NAME}. Your application has been
          received and is now under review.
        </p>
      </div>

      {/* What happens next */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-semibold text-yap-primary mb-4">
            What Happens Next?
          </h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Application Review</p>
                <p className="text-sm text-muted-foreground">
                  Our team will carefully review your application and supporting
                  documents.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Shortlisting & Interview</p>
                <p className="text-sm text-muted-foreground">
                  Shortlisted candidates will be contacted for an interview
                  round.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Final Decision</p>
                <p className="text-sm text-muted-foreground">
                  All applicants will be notified of the final decision via
                  email.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation details */}
      <Card className="border-yap-accent/20 bg-yap-accent/5">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p>
              <span className="text-muted-foreground">Submitted by: </span>
              <span className="font-medium">{user.email}</span>
            </p>
            {application.submitted_at && (
              <p>
                <span className="text-muted-foreground">Submitted on: </span>
                <span className="font-medium">
                  {new Date(application.submitted_at).toLocaleDateString(
                    "en-PK",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Karachi",
                    },
                  )}
                </span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        If you have any questions, please contact us at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-yap-accent hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </p>
    </div>
  );
}
