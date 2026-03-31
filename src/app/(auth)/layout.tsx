import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import Image from "next/image";
import { APP_NAME, APPLICATION_DEADLINE } from "@/lib/constants";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-yap-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-yap-accent)_0%,transparent_50%)] opacity-20" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <Image
                src="/YAP Logo with Text.png"
                alt="YAP Logo"
                width={240}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            {/* <h1 className="text-4xl font-bold leading-tight mb-4">
              Young Ambassador
              <br />
              Programme 2026
            </h1> */}
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              Gain hands-on professional experience through internship
              placements with AKDN agencies across Gilgit and Chitral.
            </p>
          </div>
          <div
            className="mt-16 space-y-4 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-2 h-2 rounded-full bg-yap-accent" />
              <span>6 week field placement</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-2 h-2 rounded-full bg-yap-accent" />
              <span>AKDN agencies to choose from</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-2 h-2 rounded-full bg-yap-accent" />
              <span>Professional development & mentoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Image
              src="/YAP Logo.png"
              alt="YAP Logo"
              width={100}
              height={100}
              className="object-contain"
              priority
            />
            <span className="text-lg font-bold text-yap-primary">
              {APP_NAME}
            </span>
          </div>
          <div className="mb-6 overflow-hidden rounded-xl border border-amber-200 bg-linear-to-r from-amber-100 via-orange-100 to-rose-100 p-4 text-amber-900 shadow-sm animate-fade-in-up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700/90">
              Application Deadline
            </p>
            <p className="mt-1 text-sm font-semibold">
              Submit your application by {APPLICATION_DEADLINE}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
