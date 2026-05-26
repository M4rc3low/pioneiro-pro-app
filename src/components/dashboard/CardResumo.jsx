import { cn } from "@/lib/utils";

export default function CardResumo({ icone: Icone, titulo, valor, sub, cor = "slate" }) {
  const cores = {
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    green: "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300",
    orange: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300",
    purple: "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300",
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-3">
      <div className={cn("p-2.5 rounded-xl", cores[cor])}>
        <Icone size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{titulo}</p>
        <p className="text-lg font-bold text-foreground leading-tight">{valor}</p>
        {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}
