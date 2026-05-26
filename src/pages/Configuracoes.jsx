import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { Moon, Sun, Target, User, Church, BookOpen, Download, Upload } from "lucide-react";
import { useTema } from "@/lib/theme";
import { toast } from "sonner";

export default function Configuracoes() {
  const { tema, setTema } = useTema();
  const [config, setConfig] = useState({
    nome_pioneiro: "",
    congregacao: "",
    meta_horas_mes: 50,
    meta_horas_ano: 600,
    mes_inicio_ano_servico: 9,
  });
  const [configId, setConfigId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const user = await pioneiroApi.auth.me();
      const configs = await pioneiroApi.entities.Configuracao.filter({ created_by: user.email });
      if (configs.length > 0) {
        setConfig(prev => ({ ...prev, ...configs[0] }));
        setConfigId(configs[0].id);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  const set = (campo, valor) => setConfig(c => ({ ...c, [campo]: valor }));

  async function salvar() {
    setSalvando(true);
    if (configId) {
      await pioneiroApi.entities.Configuracao.update(configId, config);
    } else {
      const nova = await pioneiroApi.entities.Configuracao.create(config);
      setConfigId(nova.id);
    }
    setSalvando(false);
    toast.success("ConfiguraÃ§Ãµes salvas!");
  }

  const meses = ["Janeiro", "Fevereiro", "MarÃ§o", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ConfiguraÃ§Ãµes</h1>
        <p className="text-sm text-muted-foreground">Personalize o aplicativo</p>
      </div>

      {/* Tema */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Tema</p>
        <div className="flex gap-3">
          <button
            onClick={() => setTema("claro")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
              tema === "claro"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Sun size={16} /> Claro
          </button>
          <button
            onClick={() => setTema("escuro")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
              tema === "escuro"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Moon size={16} /> Escuro
          </button>
        </div>
      </div>

      {/* Perfil */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <p className="text-sm font-semibold text-foreground">Meu Perfil</p>
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5"><User size={12} /> Nome</label>
          <input
            value={config.nome_pioneiro}
            onChange={e => set("nome_pioneiro", e.target.value)}
            placeholder="Seu nome"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5"><Church size={12} /> CongregaÃ§Ã£o</label>
          <input
            value={config.congregacao}
            onChange={e => set("congregacao", e.target.value)}
            placeholder="Nome da congregaÃ§Ã£o"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Metas */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Target size={16} /> Metas de Horas</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Meta mensal (horas)</label>
            <input
              type="number"
              value={config.meta_horas_mes}
              onChange={e => set("meta_horas_mes", Number(e.target.value))}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Meta anual (horas)</label>
            <input
              type="number"
              value={config.meta_horas_ano}
              onChange={e => set("meta_horas_ano", Number(e.target.value))}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5"><BookOpen size={12} /> InÃ­cio do ano de serviÃ§o</label>
          <select
            value={config.mes_inicio_ano_servico}
            onChange={e => set("mes_inicio_ano_servico", Number(e.target.value))}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            {meses.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={salvar}
        disabled={salvando}
        className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base active:scale-95 transition-all disabled:opacity-60"
      >
        {salvando ? "Salvando..." : "Salvar ConfiguraÃ§Ãµes"}
      </button>

      {/* Backup */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Backup dos Dados</p>
        <p className="text-xs text-muted-foreground">Exporte todos os seus dados para um arquivo JSON para guardar uma cÃ³pia de seguranÃ§a.</p>
        <button
          onClick={async () => {
            const user = await pioneiroApi.auth.me();
            const [atividades, configs, estudantes] = await Promise.all([
              pioneiroApi.entities.Atividade.filter({ created_by: user.email }, "-data", 5000),
              pioneiroApi.entities.Configuracao.filter({ created_by: user.email }),
              pioneiroApi.entities.Estudante.filter({ created_by: user.email }),
            ]);
            const backup = { exportado_em: new Date().toISOString(), configuracao: configs, atividades, estudantes };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `pioneiro-backup-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Backup exportado com sucesso!");
          }}
          className="w-full flex items-center justify-center gap-2 bg-muted text-foreground font-medium py-3 rounded-xl text-sm active:scale-95 transition-all"
        >
          <Download size={16} /> Exportar Backup (JSON)
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-2">
        Pioneiro Regular App â€¢ v1.0.0
      </p>
    </div>
  );
}
