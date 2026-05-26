import { Link, useLocation, Outlet } from "react-router-dom";
import { Home, PlusCircle, Users, CalendarDays, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import Onboarding from "@/components/Onboarding";
import BannerInstalar from "@/components/BannerInstalar";

const navItems = [
  { path: "/", icon: Home, label: "InÃ­cio" },
  { path: "/registrar", icon: PlusCircle, label: "Registrar" },
  { path: "/estudantes", icon: Users, label: "Estudantes" },
  { path: "/calendario", icon: CalendarDays, label: "Agenda" },
  { path: "/configuracoes", icon: Settings, label: "Config" },
];

export default function Layout() {
  const location = useLocation();
  const [onboarding, setOnboarding] = useState(null); // null=loading, true=mostrar, false=ok

  useEffect(() => {
    async function verificar() {
      const user = await pioneiroApi.auth.me();
      const configs = await pioneiroApi.entities.Configuracao.filter({ created_by: user.email });
      setOnboarding(configs.length === 0);
    }
    verificar();
  }, []);

  if (onboarding === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (onboarding) {
    return <Onboarding onConcluir={() => setOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <BannerInstalar />
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  active && "bg-primary/10"
                )}>
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  active && "font-semibold"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
