import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { Plus, Bell, CheckCircle2, Circle, Trash2, BookOpen, MapPin, Phone, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const tipoConfig = {
  estudo: { label: "Estudo", icon: BookOpen, cor: "text-blue-500 bg-blue-50 dark:bg-blue-950" },
  visita: { label: "Visita", icon: MapPin, cor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950" },
  ligacao: { label: "LigaÃ§Ã£o", icon: Phone, cor: "text-orange-500 bg-orange-50 dark:bg-orange-950" },
  outro: { label: "Outro", icon: HelpCircle, cor: "text-slate-500 bg-slate-50 dark:bg-slate-800" },
};

export default function LembretesEstudante({ estudanteId, estudanteNome }) {
  const [lembretes, setLembretes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ tipo: "estudo", descricao: "", data: format(new Date(), "yyyy-MM-dd") });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, [estudanteId]);

  async function carregar() {
    const lista = await pioneiroApi.entities.Lembrete.filter({ estudante_id: estudanteId }, "data", 50);
    setLembretes(lista);
  }

  async function salvar() {
    if (!form.data) return;
    setSalvando(true);
    await pioneiroApi.entities.Lembrete.create({
      estudante_id: estudanteId,
      estudante_nome: estudanteNome,
      tipo: form.tipo,
      descricao: form.descricao,
      data: form.data,
      concluido: false,
    });
    setMostrarForm(false);
    setForm({ tipo: "estudo", descricao: "", data: format(new Date(), "yyyy-MM-dd") });
    await carregar();
    setSalvando(false);
    toast.success("Lembrete agendado!");
  }

  async function toggleConcluido(lem) {
    await pioneiroApi.entities.Lembrete.update(lem.id, { concluido: !lem.concluido });
    setLembretes(prev => prev.map(l => l.id === lem.id ? { ...l, concluido: !l.concluido } : l));
  }

  async function remover(id) {
    await pioneiroApi.entities.Lembrete.delete(id);
    setLembretes(prev => prev.filter(l => l.id !== id));
  }

  const pendentes = lembretes.filter(l => !l.concluido);
  const concluidos = lembretes.filter(l => l.concluido);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Lembretes</p>
          {pendentes.length > 0 && (
            <span className="text-xs text-white bg-primary px-2 py-0.5 rounded-full">
              {pendentes.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setMostrarForm(v => !v)}
          className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center"
        >
          <Plus size={14} className="text-primary-foreground" />
        </button>
      </div>

      {/* Form novo lembrete */}
      {mostrarForm && (
        <div className="bg-muted rounded-xl p-3 space-y-2">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(tipoConfig).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setForm(f => ({ ...f, tipo: key }))}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                  form.tipo === key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                )}
              >
                {val.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={form.data}
            onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
            className="w-full bg-card rounded-xl px-3 py-2 text-sm text-foreground outline-none"
          />
          <input
            value={form.descricao}
            onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            placeholder="DescriÃ§Ã£o (opcional)"
            className="w-full bg-card rounded-xl px-3 py-2 text-sm text-foreground outline-none"
          />
          <button
            onClick={salvar}
            disabled={salvando}
            className="w-full bg-primary text-primary-foreground py-2 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Agendar"}
          </button>
        </div>
      )}

      {/* Pendentes */}
      {pendentes.length === 0 && concluidos.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Nenhum lembrete agendado.</p>
      ) : (
        <div className="space-y-2">
          {[...pendentes, ...concluidos].map(lem => {
            const cfg = tipoConfig[lem.tipo] || tipoConfig.outro;
            const Icone = cfg.icon;
            return (
              <div key={lem.id} className={cn("flex items-center gap-3 group", lem.concluido && "opacity-50")}>
                <button onClick={() => toggleConcluido(lem)} className="shrink-0">
                  {lem.concluido
                    ? <CheckCircle2 size={17} className="text-emerald-500" />
                    : <Circle size={17} className="text-muted-foreground" />
                  }
                </button>
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", cfg.cor)}>
                  <Icone size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-medium", lem.concluido ? "line-through text-muted-foreground" : "text-foreground")}>
                    {cfg.label} Â· {format(new Date(lem.data + "T12:00"), "d MMM", { locale: ptBR })}
                  </p>
                  {lem.descricao && <p className="text-[11px] text-muted-foreground truncate">{lem.descricao}</p>}
                </div>
                <button onClick={() => remover(lem.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} className="text-muted-foreground hover:text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
