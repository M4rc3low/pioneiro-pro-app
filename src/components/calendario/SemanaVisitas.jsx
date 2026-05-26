import { useState } from "react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Pencil, Trash2, Clock } from "lucide-react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIPO_CONFIG = {
  estudo:   { emoji: "ðŸ“–", cor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  revisita: { emoji: "ðŸ”„", cor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  ligacao:  { emoji: "ðŸ“ž", cor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  outro:    { emoji: "ðŸ“", cor: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

function labelData(dataStr) {
  const d = parseISO(dataStr);
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "AmanhÃ£";
  return format(d, "EEE, d 'de' MMM", { locale: ptBR });
}

export default function SemanaVisitas({ visitas, onAtualizar, onEditar }) {
  const [excluindo, setExcluindo] = useState(null);

  async function marcarConcluida(visita) {
    await pioneiroApi.entities.VisitaAgendada.update(visita.id, { concluida: !visita.concluida });
    onAtualizar();
  }

  async function excluir(id) {
    setExcluindo(id);
    await pioneiroApi.entities.VisitaAgendada.delete(id);
    toast.success("Visita removida.");
    onAtualizar();
    setExcluindo(null);
  }

  if (visitas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">Nenhuma visita agendada para esta semana.</p>
      </div>
    );
  }

  // Agrupar por data
  const grupos = visitas.reduce((acc, v) => {
    if (!acc[v.data]) acc[v.data] = [];
    acc[v.data].push(v);
    return acc;
  }, {});

  const datasOrdenadas = Object.keys(grupos).sort();

  return (
    <div className="space-y-4">
      {datasOrdenadas.map(data => (
        <div key={data}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {labelData(data)}
          </p>
          <div className="space-y-2">
            {grupos[data].map(v => {
              const cfg = TIPO_CONFIG[v.tipo] || TIPO_CONFIG.outro;
              return (
                <div
                  key={v.id}
                  className={cn(
                    "bg-card border border-border rounded-2xl p-3.5 flex items-center gap-3 transition-opacity",
                    v.concluida && "opacity-50"
                  )}
                >
                  {/* Check */}
                  <button
                    onClick={() => marcarConcluida(v)}
                    className={cn(
                      "w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all",
                      v.concluida
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {v.concluida && <Check size={14} className="text-white" />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-semibold", v.concluida && "line-through text-muted-foreground")}>
                        {v.estudante_nome}
                      </p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0", cfg.cor)}>
                        {cfg.emoji} {v.tipo}
                      </span>
                    </div>
                    {(v.horario || v.observacao) && (
                      <div className="flex items-center gap-2 mt-0.5">
                        {v.horario && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {v.horario}
                          </span>
                        )}
                        {v.observacao && (
                          <span className="text-xs text-muted-foreground truncate">{v.observacao}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AÃ§Ãµes */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => onEditar(v)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                      <Pencil size={12} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => excluir(v.id)}
                      disabled={excluindo === v.id}
                      className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
