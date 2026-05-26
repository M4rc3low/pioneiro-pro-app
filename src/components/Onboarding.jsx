import { useState } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { User, Church, Target, ChevronRight, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding({ onConcluir }) {
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState({
    nome_pioneiro: "",
    congregacao: "",
    meta_horas_mes: 50,
    meta_horas_ano: 600,
    mes_inicio_ano_servico: 9,
  });
  const [salvando, setSalvando] = useState(false);

  const set = (campo, valor) => setDados(d => ({ ...d, [campo]: valor }));

  async function concluir() {
    if (!dados.nome_pioneiro.trim()) {
      toast.error("Por favor, informe seu nome.");
      return;
    }
    setSalvando(true);
    await pioneiroApi.entities.Configuracao.create(dados);
    setSalvando(false);
    toast.success("Bem-vindo ao Pioneiro App! ðŸŽ‰");
    onConcluir();
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
        <BookOpen size={32} className="text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Bem-vindo!</h1>
      <p className="text-sm text-muted-foreground mb-8 text-center">
        Vamos configurar seu perfil para comeÃ§ar
      </p>

      {/* Indicador de etapa */}
      <div className="flex gap-2 mb-8">
        {[1, 2].map(i => (
          <div key={i} className={`h-2 rounded-full transition-all ${etapa === i ? "w-8 bg-primary" : "w-2 bg-muted"}`} />
        ))}
      </div>

      <div className="w-full max-w-sm space-y-4">
        {etapa === 1 && (
          <>
            <p className="text-base font-semibold text-foreground">Suas informaÃ§Ãµes</p>
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <User size={12} /> Seu nome completo *
              </label>
              <input
                autoFocus
                value={dados.nome_pioneiro}
                onChange={e => set("nome_pioneiro", e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Church size={12} /> CongregaÃ§Ã£o
              </label>
              <input
                value={dados.congregacao}
                onChange={e => set("congregacao", e.target.value)}
                placeholder="Ex: CongregaÃ§Ã£o Centro"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={() => {
                if (!dados.nome_pioneiro.trim()) { toast.error("Informe seu nome para continuar."); return; }
                setEtapa(2);
              }}
              className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              PrÃ³ximo <ChevronRight size={18} />
            </button>
          </>
        )}

        {etapa === 2 && (
          <>
            <p className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target size={16} /> Suas metas de horas
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Meta mensal (h)</label>
                <input
                  type="number"
                  value={dados.meta_horas_mes}
                  onChange={e => set("meta_horas_mes", Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Meta anual (h)</label>
                <input
                  type="number"
                  value={dados.meta_horas_ano}
                  onChange={e => set("meta_horas_ano", Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Pioneiro regular: 50h/mÃªs â€¢ 600h/ano
            </p>
            <button
              onClick={concluir}
              disabled={salvando}
              className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "ComeÃ§ar a usar o app ðŸŽ‰"}
            </button>
            <button onClick={() => setEtapa(1)} className="w-full text-sm text-muted-foreground py-2">
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
