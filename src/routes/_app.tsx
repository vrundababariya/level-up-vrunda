import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Sunrise, BookOpen, HeartPulse, Utensils,
  ShieldCheck, Sparkles, Compass, BarChart3, Music2, MoreHorizontal, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDailyStore, useStreaksStore, useFoodDbStore,
  useStudyStore, useMediaStore, useSettingsStore, useCustomHabitsStore,
} from "@/stores";
import { runDayRollover } from "@/lib/dayRollover";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/routine", label: "Daily Routine", icon: Sunrise },
  { to: "/study", label: "Study Phase", icon: BookOpen },
  { to: "/health", label: "Health Tracker", icon: HeartPulse },
  { to: "/meals", label: "Meal Logger", icon: Utensils },
  { to: "/no-rules", label: "No Rules", icon: ShieldCheck },
  { to: "/self-care", label: "Self Care", icon: Sparkles },
  { to: "/vision", label: "Vision Board", icon: Compass },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/media", label: "Media", icon: Music2 },
] as const;

const MOBILE_PRIMARY = NAV.slice(0, 4);
const MOBILE_MORE = NAV.slice(4);

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    runDayRollover();
    useDailyStore.getState().hydrate();
    useStreaksStore.getState().hydrate();
    useFoodDbStore.getState().hydrate();
    useStudyStore.getState().hydrate();
    useMediaStore.getState().hydrate();
    useSettingsStore.getState().hydrate();
    useCustomHabitsStore.getState().hydrate();
  }, []);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background shrink-0 sticky top-0 h-screen">
        <div className="px-7 py-8">
          <h1 className="font-display text-2xl leading-none">Level Up Girl</h1>
          <p className="font-display italic text-sm text-[var(--muted-foreground)] mt-1">
            becoming, daily
          </p>
        </div>
        <nav className="flex-1 px-3 pb-6 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to, "exact" in n ? n.exact : false);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-pill)] text-sm transition-all duration-300",
                  active
                    ? "nav-pill-active text-[var(--primary)] font-medium"
                    : "text-foreground hover:bg-[var(--highlight)]/60",
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className={active ? "text-[var(--primary)]" : ""}
                />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 pb-24 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 flex items-center justify-around z-40">
        {MOBILE_PRIMARY.map((n) => {
          const Icon = n.icon;
          const active = isActive(n.to, "exact" in n ? n.exact : false);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-[10px]",
                active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]",
              )}
            >
              <Icon size={20} strokeWidth={1.5} />
              {n.label.split(" ")[0]}
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] text-[var(--muted-foreground)]"
        >
          <MoreHorizontal size={20} strokeWidth={1.5} />
          More
        </button>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/30"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[24px] p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl">More</h3>
              <button onClick={() => setDrawerOpen(false)}>
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MOBILE_MORE.map((n) => {
                const Icon = n.icon;
                const active = isActive(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-[var(--radius)] border border-border",
                      active && "nav-pill-active",
                    )}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className={active ? "text-[var(--primary)]" : ""}
                    />
                    <span className="text-[11px] text-center leading-tight">{n.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
