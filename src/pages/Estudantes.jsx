import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { Plus, Search, User, Clock, Monitor, MapPin, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import FormEstudante from "@/components/estudantes/FormEstudante";
import DetalhesEstudante from "@/components/estudantes/DetalhesEstudante";

const statusCores = {
  ativo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  pausado: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  encerrado: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const horarioLabel = { manha: "ManhÃ£", tarde: "Tarde", noite: "Noite" };

export default function Estudantes() {
  const [estudantes, setEstudantes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ativo");
  const [loading, setLoading] = useState(true);
  const [tela, setTela] = useState("lista");
  const [selecionado, setSelecionado] = useState(null);

  async function carregar() {
    setLoading(true);
    const user = await pioneiroApi.auth.me();
    const lista = await pioneiroApi.entities.Estudante.filter({ created_by: user.email }, "-created_date", 200);
    setEstudantes(lista);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = estudantes.filter(e => {
    const buscaOk = e.nome?.toLowerCase().includes(busca.toLowerCase());
    const statusOk = filtroStatus === "todos" || e.status === filtroStatus;
    return buscaOk && statusOk;
  });

  if (tela === "form") {
    return <FormEstudante estudante={selecionado} onSalvo={() => { setSelecionado(null); setTela("lista"); carregar(); }} onCancelar={() => { setSelecionado(null); setTela("lista"); }} />;
  }

  if (tela === "detalhes" && selecionado) {
    return <DetalhesEstudante estudante={selecionado} onEditar={() => setTela("form")} onVoltar={() => { setSelecionado(null); setTela("lista"); carregar(); }} onAtualizar={setSelecionado} />;
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estudantes</h1>
          <p className="text-sm text-muted-foreground">{estudantes.filter(e => e.status === "ativo").length} ativos</p>
        </div>
        <button
          onClick={() => { setSelecionado(null); setTela("form"); }}
          className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={20} className="text-primary-foreground" />
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar estudante..."
          className="w-full bg-card border border-border rounded-2xl pl-9 pr-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex gap-2">
        {["ativo", "pausado", "encerrado", "todos"].map(s => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize",
              filtroStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-14">
          <User size={40} className="mx-auto text-muted-foreground mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm">Nenhum estudante encontrado</p>
          <button onClick={() => setTela("form")} className="mt-3 text-primary text-sm font-medium">+ Adicionar estudante</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(e => (
            <button
              key={e.id}
              onClick={() => { setSelecionado(e); setTela("detalhes"); }}
              className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-base">{e.nome?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{e.nome}</p>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", statusCores[e.status || "ativo"])}>
                    {e.status || "ativo"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {e.horario_preferido && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      <span>{horarioLabel[e.horario_preferido]}</span>
                    </div>
                  )}
                  {e.modalidade && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {e.modalidade === "online" ? <Monitor size={11} /> : <MapPin size={11} />}
                      <span className="capitalize">{e.modalidade}</span>
                    </div>
                  )}
                  {e.publicacao_atual && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BookOpen size={11} />
                      <span className="truncate max-w-[100px]">{e.publicacao_atual}</span>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
