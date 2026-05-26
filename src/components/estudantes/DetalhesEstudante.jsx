import { useState } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { ArrowLeft, Pencil, Trash2, Clock, Monitor, MapPin, BookOpen, Phone, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import ChecklistObjetivos from "@/components/estudantes/ChecklistObjetivos";
import LembretesEstudante from "@/components/estudantes/LembretesEstudante";
import NotasRapidas from "@/components/estudantes/NotasRapidas";

const statusCores = {
  ativo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  pausado: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  encerrado: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const horarioLabel = { manha: "ManhÃ£", tarde: "Tarde", noite: "Noite" };

export default function DetalhesEstudante({ estudante, onEditar, onVoltar }) {
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);

  async function excluir() {
    setExcluindo(true);
    await pioneiroApi.entities.Estudante.delete(estudante.id);
    toast.success("Estudante removido.");
    onVoltar();
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onVoltar} className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex gap-2">
          <button onClick={onEditar} className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
            <Pencil size={16} className="text-foreground" />
          </button>
          <button onClick={() => setConfirmarExcluir(true)} className="w-9 h-9 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Perfil */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-2xl">{estudante.nome?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{estudante.nome}</h2>
          <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusCores[estudante.status || "ativo"])}>
            {estudante.status || "ativo"}
          </span>
        </div>
      </div>

      {/* InformaÃ§Ãµes */}
      <div className="bg-card border border-border rounded-2xl px-4 divide-y divide-border">
        {estudante.telefone && (
          <div className="flex items-start gap-3 py-3">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Phone size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm font-medium text-foreground">{estudante.telefone}</p>
            </div>
          </div>
        )}
        {estudante.horario_preferido && (
          <div className="flex items-start gap-3 py-3">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Clock size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">HorÃ¡rio preferido</p>
              <p className="text-sm font-medium text-foreground">{horarioLabel[estudante.horario_preferido]}</p>
            </div>
          </div>
        )}
        {estudante.modalidade && (
          <div className="flex items-start gap-3 py-3">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              {estudante.modalidade === "online" ? <Monitor size={15} className="text-muted-foreground" /> : <MapPin size={15} className="text-muted-foreground" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modalidade</p>
              <p className="text-sm font-medium text-foreground capitalize">{estudante.modalidade}</p>
            </div>
          </div>
        )}
        {estudante.publicacao_atual && (
          <div className="flex items-start gap-3 py-3">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">PublicaÃ§Ã£o em estudo</p>
              <p className="text-sm font-medium text-foreground">{estudante.publicacao_atual}</p>
              {estudante.licao_atual && <p className="text-xs text-muted-foreground mt-0.5">{estudante.licao_atual}</p>}
            </div>
          </div>
        )}
        {estudante.data_inicio && (
          <div className="flex items-start gap-3 py-3">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <CalendarDays size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">InÃ­cio do estudo</p>
              <p className="text-sm font-medium text-foreground">
                {format(new Date(estudante.data_inicio + "T12:00"), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        )}
        {estudante.endereco && (
          <div className="flex items-start gap-3 py-3">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">EndereÃ§o</p>
              <p className="text-sm font-medium text-foreground">{estudante.endereco}</p>
            </div>
          </div>
        )}
      </div>

      {/* HistÃ³rico */}
      {estudante.historico && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">HistÃ³rico & ObservaÃ§Ãµes</p>
          <p className="text-sm text-foreground leading-relaxed">{estudante.historico}</p>
        </div>
      )}

      {/* Checklist de Objetivos */}
      <ChecklistObjetivos estudanteId={estudante.id} />

      {/* Lembretes */}
      <LembretesEstudante estudanteId={estudante.id} estudanteNome={estudante.nome} />

      {/* Notas RÃ¡pidas */}
      <NotasRapidas estudanteId={estudante.id} />

      {/* Modal confirmar exclusÃ£o */}
      {confirmarExcluir && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">Excluir estudante?</h3>
            <p className="text-sm text-muted-foreground">Esta aÃ§Ã£o nÃ£o pode ser desfeita. Todos os dados de <strong>{estudante.nome}</strong> serÃ£o removidos.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExcluir(false)} className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium">Cancelar</button>
              <button onClick={excluir} disabled={excluindo} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium disabled:opacity-60">
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
