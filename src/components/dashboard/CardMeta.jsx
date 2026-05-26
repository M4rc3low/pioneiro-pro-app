import { cn } from "@/lib/utils";

export default function CardMeta({ titulo, horasFeitas, metaHoras, subtitulo, cor = "blue" }) {
  const pct = Math.min((horasFeitas / metaHoras) * 100, 100);
  const faltam = Math.max(metaHoras - horasFeitas, 0);

  const cores = {
    blue: { bar: "bg-blue-500", texto: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950" },
    green: { bar: "bg-emerald-500", texto: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950" },
    purple: { bar: "bg-violet-500", texto: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950" },
  };

  const c = cores[cor];

  const horas = Math.floor(horasFeitas);
  const minutos = Math.round((horasFeitas - horas) * 60);
  const horasStr = minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;

  const faltamH = Math.floor(faltam);
  const faltamMin = Math.round((faltam - faltamH) * 60);
  const faltamStr = faltamMin > 0 ? `${faltamH}h ${faltamMin}min` : `${faltamH}h`;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{titulo}</p>
          {subtitulo && <p className="text-xs text-muted-foreground mt-0.5">{subtitulo}</p>}
        </div>
        <span className={cn("text-xs font-bold px-2 py-1 rounded-full", c.bg, c.texto)}>
          {Math.round(pct)}%
        </span>
      </div>

      <div className="mb-2">
        <span className={cn("text-3xl font-bold", c.texto)}>{horasStr}</span>
        <span className="text-muted-foreground text-sm ml-1">/ {metaHoras}h</span>
      </div>

      <div className="w-full bg-muted rounded-full h-2.5 mb-2">
        <div
          className={cn("h-2.5 rounded-full transition-all duration-700", c.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {faltam > 0 ? (
        <p className="text-xs text-muted-foreground">Faltam <span className="font-semibold">{faltamStr}</span></p>
      ) : (
        <p className={cn("text-xs font-semibold", c.texto)}>âœ“ Meta atingida!</p>
      )}
    </div>
  );
}
