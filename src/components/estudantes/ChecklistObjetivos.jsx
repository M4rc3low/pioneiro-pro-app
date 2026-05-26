import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { Plus, CheckCircle2, Circle, Trash2, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ChecklistObjetivos({ estudanteId }) {
  const [objetivos, setObjetivos] = useState([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [mostrarInput, setMostrarInput] = useState(false);

  useEffect(() => {
    carregar();
  }, [estudanteId]);

  async function carregar() {
    const lista = await pioneiroApi.entities.ObjetivoEstudante.filter({ estudante_id: estudanteId });
    setObjetivos(lista);
  }

  async function adicionar() {
    if (!novoTexto.trim()) return;
    setAdicionando(true);
    await pioneiroApi.entities.ObjetivoEstudante.create({
      estudante_id: estudanteId,
      texto: novoTexto.trim(),
      concluido: false,
    });
    setNovoTexto("");
    setMostrarInput(false);
    await carregar();
    setAdicionando(false);
  }

  async function toggleConcluido(obj) {
    await pioneiroApi.entities.ObjetivoEstudante.update(obj.id, { concluido: !obj.concluido });
    setObjetivos(prev => prev.map(o => o.id === obj.id ? { ...o, concluido: !o.concluido } : o));
  }

  async function remover(id) {
    await pioneiroApi.entities.ObjetivoEstudante.delete(id);
    setObjetivos(prev => prev.filter(o => o.id !== id));
    toast.success("Objetivo removido.");
  }

  const concluidos = objetivos.filter(o => o.concluido).length;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Objetivos</p>
          {objetivos.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {concluidos}/{objetivos.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setMostrarInput(v => !v)}
          className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center"
        >
          <Plus size={14} className="text-primary-foreground" />
        </button>
      </div>

      {/* Barra de progresso */}
      {objetivos.length > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(concluidos / objetivos.length) * 100}%` }}
          />
        </div>
      )}

      {/* Input novo objetivo */}
      {mostrarInput && (
        <div className="flex gap-2">
          <input
            value={novoTexto}
            onChange={e => setNovoTexto(e.target.value)}
            onKeyDown={e => e.key === "Enter" && adicionar()}
            placeholder="Ex: Ler capÃ­tulo 3..."
            autoFocus
            className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={adicionar}
            disabled={adicionando || !novoTexto.trim()}
            className="bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {adicionando ? "..." : "Add"}
          </button>
        </div>
      )}

      {/* Lista */}
      {objetivos.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Nenhum objetivo ainda. Adicione um!</p>
      ) : (
        <div className="space-y-2">
          {objetivos.map(obj => (
            <div key={obj.id} className="flex items-center gap-3 group">
              <button onClick={() => toggleConcluido(obj)} className="shrink-0">
                {obj.concluido
                  ? <CheckCircle2 size={18} className="text-emerald-500" />
                  : <Circle size={18} className="text-muted-foreground" />
                }
              </button>
              <p className={cn(
                "flex-1 text-sm",
                obj.concluido ? "line-through text-muted-foreground" : "text-foreground"
              )}>
                {obj.texto}
              </p>
              <button
                onClick={() => remover(obj.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={13} className="text-muted-foreground hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
