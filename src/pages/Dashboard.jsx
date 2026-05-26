import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { BookOpen, RotateCcw, BookMarked, Video } from "lucide-react";
import CardMeta from "@/components/dashboard/CardMeta";
import CardResumo from "@/components/dashboard/CardResumo";
import GraficoMeses from "@/components/dashboard/GraficoMeses";
import CardRitmo from "@/components/dashboard/CardRitmo";
import BotaoNotificacao from "@/components/dashboard/BotaoNotificacao";
import AlertaRitmo from "@/components/dashboard/AlertaRitmo";
import BannerOffline from "@/components/dashboard/BannerOffline";
import AgendaDoDia from "@/components/dashboard/AgendaDoDia";
import Cronometro from "@/components/dashboard/Cronometro";
import SugerirVisitas from "@/components/dashboard/SugerirVisitas";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import {
  getMesAtual, getMesNome, calcularAtividadesMes,
  calcularAtividadesAno, calcularTotalHoras, formatarHoras
} from "@/lib/utils-pioneiro";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [atividades, setAtividades] = useState([]);
  const [config, setConfig] = useState({ meta_horas_mes: 50, meta_horas_ano: 600, nome_pioneiro: "", mes_inicio_ano_servico: 9 });
  const [loading, setLoading] = useState(true);
  const { isOnline, pendentes } = useOfflineSync();

  useEffect(() => {
    async function carregar() {
      const user = await pioneiroApi.auth.me();
      const [ativs, configs] = await Promise.all([
        pioneiroApi.entities.Atividade.filter({ created_by: user.email }, "-data", 500),
        pioneiroApi.entities.Configuracao.filter({ created_by: user.email })
      ]);
      setAtividades(ativs);
      if (configs.length > 0) setConfig(prev => ({ ...prev, ...configs[0] }));
      setLoading(false);
    }
    carregar();
  }, []);

  const mesAtual = getMesAtual();
  const ativsMes = calcularAtividadesMes(atividades, mesAtual);
  const ativsAno = calcularAtividadesAno(atividades, config.mes_inicio_ano_servico);

  const horasMes = calcularTotalHoras(ativsMes);
  const horasAno = calcularTotalHoras(ativsAno);

  const revisitasMes = ativsMes.reduce((acc, a) => acc + (a.revisitas || 0), 0);
  const publicacoesMes = ativsMes.reduce((acc, a) => acc + (a.publicacoes || 0), 0);
  const videosMes = ativsMes.reduce((acc, a) => acc + (a.videos || 0), 0);
  const estudosMes = ativsMes.reduce((acc, a) => acc + (a.estudos || 0), 0);

  const hoje = new Date();
  const saudacao = hoje.getHours() < 12 ? "Bom dia" : hoje.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const nomeStr = config.nome_pioneiro ? `, ${config.nome_pioneiro.split(" ")[0]}` : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{saudacao}! ðŸ‘‹</p>
          <h1 className="text-2xl font-bold text-foreground">
            {config.nome_pioneiro ? config.nome_pioneiro.split(" ")[0] : "Pioneiro"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(hoje, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BotaoNotificacao />
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-primary-foreground" />
          </div>
        </div>
      </div>

      <BannerOffline isOnline={isOnline} pendentes={pendentes} />
      <Cronometro />
      <SugerirVisitas />
      <AgendaDoDia />
      <AlertaRitmo horasMes={horasMes} metaMes={config.meta_horas_mes} />

      <div className="space-y-3">
        <CardMeta titulo="Progresso do MÃªs" subtitulo={getMesNome(mesAtual)} horasFeitas={horasMes} metaHoras={config.meta_horas_mes} cor="blue" />
        <CardMeta titulo="Ano de ServiÃ§o" subtitulo={`Meta: ${config.meta_horas_ano}h`} horasFeitas={horasAno} metaHoras={config.meta_horas_ano} cor="green" />
      </div>

      <CardRitmo horasMes={horasMes} metaMes={config.meta_horas_mes} horasAno={horasAno} metaAno={config.meta_horas_ano} mesInicioAno={config.mes_inicio_ano_servico} />

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Resumo do MÃªs</p>
        <div className="grid grid-cols-2 gap-3">
          <CardResumo icone={RotateCcw} titulo="Revisitas" valor={revisitasMes} cor="blue" />
          <CardResumo icone={BookMarked} titulo="Estudos" valor={estudosMes} cor="green" />
          <CardResumo icone={BookOpen} titulo="PublicaÃ§Ãµes" valor={publicacoesMes} cor="orange" />
          <CardResumo icone={Video} titulo="VÃ­deos" valor={videosMes} cor="purple" />
        </div>
      </div>

      <GraficoMeses atividades={atividades} metaMes={config.meta_horas_mes} />
    </div>
  );
}
