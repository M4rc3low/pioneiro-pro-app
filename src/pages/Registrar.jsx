import { useState } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import BannerOffline from "@/components/dashboard/BannerOffline";
import { format } from "date-fns";
import { CheckCircle2, Clock, RotateCcw, BookMarked, BookOpen, Video, FileText } from "lucide-react";
import { toast } from "sonner";

function CampoNumero({ icone: Icone, label, valor, onChange, cor }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icone size={18} className={cor} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, valor - 1))}
          className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-xl flex items-center justify-center active:scale-95 transition-transform"
        >âˆ’</button>
        <span className="flex-1 text-center text-2xl font-bold text-foreground">{valor}</span>
        <button
          onClick={() => onChange(valor + 1)}
          className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center active:scale-95 transition-transform"
        >+</button>
      </div>
    </div>
  );
}

export default function Registrar() {
  const hoje = format(new Date(), "yyyy-MM-dd");
  const { isOnline, pendentes, criarAtividade } = useOfflineSync();
  const [data, setData] = useState(hoje);
  const [horas, setHoras] = useState(0);
  const [minutos, setMinutos] = useState(0);
  const [revisitas, setRevisitas] = useState(0);
  const [publicacoes, setPublicacoes] = useState(0);
  const [videos, setVideos] = useState(0);
  const [estudos, setEstudos] = useState(0);
  const [obs, setObs] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const minutosOpcoes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  async function salvar() {
    if (horas === 0 && minutos === 0) {
      toast.error("Informe pelo menos 1 hora ou alguns minutos.");
      return;
    }
    setSalvando(true);
    await criarAtividade({
      data, horas, minutos, revisitas, publicacoes, videos, estudos,
      observacoes: obs
    });
    setSalvando(false);
    setSalvo(true);
    toast.success("Atividade registrada com sucesso!");
    setTimeout(() => {
      setSalvo(false);
      setHoras(0); setMinutos(0); setRevisitas(0);
      setPublicacoes(0); setVideos(0); setEstudos(0); setObs("");
      setData(hoje);
    }, 2000);
  }

  if (salvo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Registrado!</h2>
        <p className="text-muted-foreground text-center">Sua atividade foi salva com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registrar Atividade</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Lance as horas e atividades do dia</p>
      </div>
      <BannerOffline isOnline={isOnline} pendentes={pendentes} />

      {/* Data */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <label className="text-sm font-medium text-foreground block mb-2">Data</label>
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Horas */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-blue-500" />
          <span className="text-sm font-medium text-foreground">Horas de PregaÃ§Ã£o</span>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2 text-center">Horas</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setHoras(Math.max(0, horas - 1))} className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-xl flex items-center justify-center">âˆ’</button>
              <span className="flex-1 text-center text-2xl font-bold text-foreground">{horas}</span>
              <button onClick={() => setHoras(horas + 1)} className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center">+</button>
            </div>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2 text-center">Minutos</p>
            <select
              value={minutos}
              onChange={e => setMinutos(Number(e.target.value))}
              className="w-full bg-muted rounded-xl px-2 py-3 text-foreground text-sm text-center outline-none focus:ring-2 focus:ring-primary/30"
            >
              {minutosOpcoes.map(m => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Atividades */}
      <div className="grid grid-cols-2 gap-3">
        <CampoNumero icone={RotateCcw} label="Revisitas" valor={revisitas} onChange={setRevisitas} cor="text-blue-500" />
        <CampoNumero icone={BookMarked} label="Estudos" valor={estudos} onChange={setEstudos} cor="text-emerald-500" />
        <CampoNumero icone={BookOpen} label="PublicaÃ§Ãµes" valor={publicacoes} onChange={setPublicacoes} cor="text-orange-500" />
        <CampoNumero icone={Video} label="VÃ­deos" valor={videos} onChange={setVideos} cor="text-violet-500" />
      </div>

      {/* ObservaÃ§Ãµes */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">ObservaÃ§Ãµes</span>
        </div>
        <textarea
          value={obs}
          onChange={e => setObs(e.target.value)}
          placeholder="Como foi o dia? Algo especial aconteceu?"
          rows={3}
          className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* BotÃ£o salvar */}
      <button
        onClick={salvar}
        disabled={salvando}
        className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base active:scale-95 transition-all disabled:opacity-60"
      >
        {salvando ? "Salvando..." : "Salvar Atividade"}
      </button>
    </div>
  );
}
