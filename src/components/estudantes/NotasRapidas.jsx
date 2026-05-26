import { useState, useEffect, useRef } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { StickyNote, Plus, Trash2, Send } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function NotasRapidas({ estudanteId }) {
  const [notas, setNotas] = useState([]);
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    carregar();
  }, [estudanteId]);

  async function carregar() {
    const lista = await pioneiroApi.entities.NotaEstudante.filter(
      { estudante_id: estudanteId },
      "-created_date",
      50
    );
    setNotas(lista);
  }

  async function salvar() {
    if (!texto.trim()) return;
    setSalvando(true);
    await pioneiroApi.entities.NotaEstudante.create({
      estudante_id: estudanteId,
      texto: texto.trim(),
    });
    setTexto("");
    await carregar();
    setSalvando(false);
    toast.success("Nota salva!");
  }

  async function remover(id) {
    await pioneiroApi.entities.NotaEstudante.delete(id);
    setNotas(prev => prev.filter(n => n.id !== id));
  }

  function formatarData(dateStr) {
    if (!dateStr) return "";
    const d = parseISO(dateStr);
    return format(d, "d MMM yyyy 'Ã s' HH:mm", { locale: ptBR });
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <StickyNote size={16} className="text-primary" />
        <p className="text-sm font-semibold text-foreground">Notas RÃ¡pidas</p>
        {notas.length > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {notas.length}
          </span>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              salvar();
            }
          }}
          placeholder="AnotaÃ§Ã£o rÃ¡pida... (Enter para salvar)"
          rows={2}
          className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"
        />
        <button
          onClick={salvar}
          disabled={salvando || !texto.trim()}
          className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
        >
          <Send size={15} className="text-primary-foreground" />
        </button>
      </div>

      {/* Lista de notas */}
      {notas.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhuma nota ainda. Registre observaÃ§Ãµes da visita!
        </p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {notas.map(nota => (
            <div
              key={nota.id}
              className="group bg-muted/60 rounded-xl px-3 py-2.5 relative"
            >
              <p className="text-sm text-foreground leading-relaxed pr-6">
                {nota.texto}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatarData(nota.created_date)}
              </p>
              <button
                onClick={() => remover(nota.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
