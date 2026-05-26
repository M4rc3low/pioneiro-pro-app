import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { X, Calendar, Clock, User, Bell } from "lucide-react";
import { toast } from "sonner";

const TIPOS = [
  { value: "estudo", label: "Estudo BÃ­blico", emoji: "ðŸ“–" },
  { value: "revisita", label: "Revisita", emoji: "ðŸ”„" },
  { value: "ligacao", label: "LigaÃ§Ã£o", emoji: "ðŸ“ž" },
  { value: "outro", label: "Outro", emoji: "ðŸ“" },
];

export default function FormVisita({ visita, dataInicial, onSalvo, onFechar }) {
  const [estudantes, setEstudantes] = useState([]);
  const [form, setForm] = useState({
    estudante_id: visita?.estudante_id || "",
    estudante_nome: visita?.estudante_nome || "",
    data: visita?.data || dataInicial || "",
    horario: visita?.horario || "",
    tipo: visita?.tipo || "estudo",
    observacao: visita?.observacao || "",
    lembrete: visita?.lembrete ?? true,
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const user = await pioneiroApi.auth.me();
      const lista = await pioneiroApi.entities.Estudante.filter(
        { created_by: user.email, status: "ativo" },
        "nome",
        100
      );
      setEstudantes(lista);
    }
    carregar();
  }, []);

  function setEstudante(id) {
    const est = estudantes.find(e => e.id === id);
    setForm(f => ({ ...f, estudante_id: id, estudante_nome: est?.nome || "" }));
  }

  async function salvar() {
    if (!form.estudante_id || !form.data) {
      toast.error("Selecione o estudante e a data.");
      return;
    }
    setSalvando(true);
    if (visita?.id) {
      await pioneiroApi.entities.VisitaAgendada.update(visita.id, form);
    } else {
      await pioneiroApi.entities.VisitaAgendada.create(form);
    }
    toast.success(visita?.id ? "Visita atualizada!" : "Visita agendada!");
    onSalvo();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end justify-center p-0">
      <div className="bg-card w-full max-w-md rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            {visita?.id ? "Editar Visita" : "Agendar Visita"}
          </h3>
          <button onClick={onFechar} className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Estudante */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <User size={12} /> Estudante *
          </label>
          <select
            value={form.estudante_id}
            onChange={e => setEstudante(e.target.value)}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Selecionar estudante...</option>
            {estudantes.map(e => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar size={12} /> Data *
            </label>
            <input
              type="date"
              value={form.data}
              onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock size={12} /> HorÃ¡rio
            </label>
            <input
              type="time"
              value={form.horario}
              onChange={e => setForm(f => ({ ...f, horario: e.target.value }))}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map(t => (
              <button
                key={t.value}
                onClick={() => setForm(f => ({ ...f, tipo: t.value }))}
                className={`py-2 px-3 rounded-xl text-xs font-medium text-left transition-all ${
                  form.tipo === t.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ObservaÃ§Ã£o */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">ObservaÃ§Ã£o</label>
          <textarea
            value={form.observacao}
            onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
            placeholder="Algum detalhe sobre a visita..."
            rows={2}
            className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Lembrete */}
        <div className="flex items-center justify-between bg-muted/60 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-muted-foreground" />
            <span className="text-sm text-foreground">Adicionar ao Lembretes</span>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, lembrete: !f.lembrete }))}
            className={`w-10 h-6 rounded-full transition-all ${form.lembrete ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-all ${form.lembrete ? "translate-x-4" : ""}`} style={{ transform: form.lembrete ? "translateX(16px)" : "translateX(0)" }} />
          </button>
        </div>

        {/* BotÃ£o salvar */}
        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm disabled:opacity-60"
        >
          {salvando ? "Salvando..." : visita?.id ? "Salvar AlteraÃ§Ãµes" : "Agendar Visita"}
        </button>
      </div>
    </div>
  );
}
