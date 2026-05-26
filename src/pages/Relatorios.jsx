import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { FileText, Copy, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getMesNome, getUltimosMeses, calcularAtividadesMes, calcularTotalHoras } from "@/lib/utils-pioneiro";
import { cn } from "@/lib/utils";

export default function Relatorios() {
  const [atividades, setAtividades] = useState([]);
  const [config, setConfig] = useState({ meta_horas_mes: 50, nome_pioneiro: "", congregacao: "" });
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(true);

  const meses = getUltimosMeses(12);

  useEffect(() => {
    async function carregar() {
      const user = await pioneiroApi.auth.me();
      const [ativs, configs] = await Promise.all([
        pioneiroApi.entities.Atividade.filter({ created_by: user.email }, "-data", 500),
        pioneiroApi.entities.Configuracao.filter({ created_by: user.email })
      ]);
      setAtividades(ativs);
      if (configs.length > 0) setConfig(prev => ({ ...prev, ...configs[0] }));
      const mesComDados = meses.slice().reverse().find(m =>
        calcularAtividadesMes(ativs, m).length > 0
      ) || meses[meses.length - 1];
      setMesSelecionado(mesComDados);
      setLoading(false);
    }
    carregar();
  }, []);

  const ativsMes = calcularAtividadesMes(atividades, mesSelecionado);
  const totalHoras = calcularTotalHoras(ativsMes);
  const horasInt = Math.floor(totalHoras);
  const minutos = Math.round((totalHoras - horasInt) * 60);
  const totalRevisitas = ativsMes.reduce((acc, a) => acc + (a.revisitas || 0), 0);
  const totalPublicacoes = ativsMes.reduce((acc, a) => acc + (a.publicacoes || 0), 0);
  const totalVideos = ativsMes.reduce((acc, a) => acc + (a.videos || 0), 0);
  const totalEstudos = ativsMes.reduce((acc, a) => acc + (a.estudos || 0), 0);

  const horasTexto = minutos > 0 ? `${horasInt}h ${minutos}min` : `${horasInt}h`;

  function gerarTextoRelatorio() {
    const nome = config.nome_pioneiro || "[Seu Nome]";
    const congregacao = config.congregacao || "[CongregaÃ§Ã£o]";
    const mes = getMesNome(mesSelecionado);

    return `ðŸ“‹ RELATÃ“RIO MENSAL - ${mes.toUpperCase()}
ðŸ‘¤ ${nome}
ðŸ›ï¸ ${congregacao}

â±ï¸ Horas: ${horasTexto}
ðŸ“– Estudos bÃ­blicos: ${totalEstudos}
ðŸ”„ Revisitas: ${totalRevisitas}
ðŸ“š PublicaÃ§Ãµes: ${totalPublicacoes}
ðŸŽ¬ VÃ­deos: ${totalVideos}

Meta do mÃªs: ${config.meta_horas_mes}h
${totalHoras >= config.meta_horas_mes ? "âœ… Meta atingida!" : `âš ï¸ Faltaram ${Math.ceil(config.meta_horas_mes - totalHoras)}h para a meta`}`;
  }

  function copiar() {
    navigator.clipboard.writeText(gerarTextoRelatorio());
    setCopiado(true);
    toast.success("RelatÃ³rio copiado!");
    setTimeout(() => setCopiado(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">RelatÃ³rios</h1>
        <p className="text-sm text-muted-foreground">Resumo mensal das suas atividades</p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Selecionar mÃªs</label>
        <select
          value={mesSelecionado}
          onChange={e => setMesSelecionado(e.target.value)}
          className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          {meses.slice().reverse().map(m => (
            <option key={m} value={m}>{getMesNome(m)}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{getMesNome(mesSelecionado)}</h2>
          {totalHoras >= config.meta_horas_mes ? (
            <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">Meta atingida âœ“</span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full font-medium">Meta nÃ£o atingida</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-xl p-3"><p className="text-xs text-muted-foreground">Horas</p><p className="text-xl font-bold text-foreground">{horasTexto}</p><p className="text-xs text-muted-foreground">meta: {config.meta_horas_mes}h</p></div>
          <div className="bg-muted rounded-xl p-3"><p className="text-xs text-muted-foreground">Estudos bÃ­blicos</p><p className="text-xl font-bold text-foreground">{totalEstudos}</p></div>
          <div className="bg-muted rounded-xl p-3"><p className="text-xs text-muted-foreground">Revisitas</p><p className="text-xl font-bold text-foreground">{totalRevisitas}</p></div>
          <div className="bg-muted rounded-xl p-3"><p className="text-xs text-muted-foreground">PublicaÃ§Ãµes</p><p className="text-xl font-bold text-foreground">{totalPublicacoes}</p></div>
        </div>
      </div>

      <div className="bg-muted rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Preview do relatÃ³rio</p>
        <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">{gerarTextoRelatorio()}</pre>
      </div>

      <button
        onClick={copiar}
        className={cn(
          "w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-all active:scale-95",
          copiado ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
        )}
      >
        {copiado ? <><CheckCircle2 size={20} /> Copiado!</> : <><Copy size={20} /> Copiar para WhatsApp</>}
      </button>

      {ativsMes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Registros do mÃªs ({ativsMes.length})</p>
          <div className="space-y-2">
            {ativsMes.sort((a, b) => b.data?.localeCompare(a.data)).map(a => (
              <div key={a.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.data ? new Date(a.data + "T12:00").toLocaleDateString("pt-BR") : "â€”"}</p>
                  <p className="text-xs text-muted-foreground">{a.horas || 0}h{a.minutos ? ` ${a.minutos}min` : ""} Â· {a.revisitas || 0} rev Â· {a.estudos || 0} est</p>
                </div>
                {a.observacoes && <div className="w-2 h-2 bg-primary rounded-full" title={a.observacoes} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
