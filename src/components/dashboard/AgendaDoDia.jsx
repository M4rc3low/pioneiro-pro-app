import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { CalendarCheck, BookOpen, MapPin, Phone, HelpCircle, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const tipoConfig = {
  estudo: { label: "Estudo", icon: BookOpen, cor: "text-blue-500" },
  visita: { label: "Visita", icon: MapPin, cor: "text-emerald-500" },
  ligacao: { label: "LigaÃ§Ã£o", icon: Phone, cor: "text-orange-500" },
  outro: { label: "Outro", icon: HelpCircle, cor: "text-slate-500" },
};

export default function AgendaDoDia() {
  const [lembretes, setLembretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const hoje = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    async function carregar() {
      const user = await pioneiroApi.auth.me();
      const lista = await pioneiroApi.entities.Lembrete.filter({
        created_by: user.email,
        data: hoje,
        concluido: false,
      });
      setLembretes(lista);
      setLoading(false);
    }
    carregar();
  }, []);

  async function marcarConcluido(lem) {
    await pioneiroApi.entities.Lembrete.update(lem.id, { concluido: true });
    setLembretes(prev => prev.filter(l => l.id !== lem.id));
  }

  if (loading || lembretes.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarCheck size={16} className="text-primary" />
        <p className="text-sm font-semibold text-foreground">Agenda do Dia</p>
        <span className="text-xs text-white bg-primary px-2 py-0.5 rounded-full">{lembretes.length}</span>
      </div>
      <div className="space-y-2">
        {lembretes.map(lem => {
          const cfg = tipoConfig[lem.tipo] || tipoConfig.outro;
          const Icone = cfg.icon;
          return (
            <div key={lem.id} className="flex items-center gap-3">
              <button onClick={() => marcarConcluido(lem)} className="shrink-0">
                <Circle size={17} className="text-muted-foreground" />
              </button>
              <Icone size={15} className={cn("shrink-0", cfg.cor)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{lem.estudante_nome}</p>
                <p className="text-xs text-muted-foreground">{cfg.label}{lem.descricao ? ` Â· ${lem.descricao}` : ""}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
