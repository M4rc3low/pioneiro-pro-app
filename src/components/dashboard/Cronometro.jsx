import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Timer, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { pioneiroApi } from "@/api/pioneiroClient";
import { format } from "date-fns";
import { toast } from "sonner";

function formatarTempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Cronometro() {
  const [rodando, setRodando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [iniciado, setIniciado] = useState(false);
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ revisitas: 0, publicacoes: 0, videos: 0, estudos: 0, observacoes: "" });
  const intervaloRef = useRef(null);

  useEffect(() => {
    const salvo = localStorage.getItem("cronometro_pioneiro");
    if (salvo) {
      const { segundosSalvos, timestampInicio, estaRodando } = JSON.parse(salvo);
      if (estaRodando && timestampInicio) {
        const decorrido = Math.floor((Date.now() - timestampInicio) / 1000);
        setSegundos(segundosSalvos + decorrido);
        setRodando(true);
        setIniciado(true);
      } else if (segundosSalvos > 0) {
        setSegundos(segundosSalvos);
        setIniciado(true);
      }
    }
  }, []);

  useEffect(() => {
    if (rodando) {
      intervaloRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
    } else {
      clearInterval(intervaloRef.current);
    }
    return () => clearInterval(intervaloRef.current);
  }, [rodando]);

  useEffect(() => {
    if (iniciado) {
      localStorage.setItem("cronometro_pioneiro", JSON.stringify({
        segundosSalvos: segundos,
        timestampInicio: rodando ? Date.now() - segundos * 1000 : null,
        estaRodando: rodando,
      }));
    }
  }, [segundos, rodando, iniciado]);

  function iniciarPausar() {
    if (!iniciado) setIniciado(true);
    setRodando(r => !r);
  }

  function abrirRegistrar() {
    setRodando(false);
    setModalRegistrar(true);
  }

  function descartar() {
    setRodando(false);
    setSegundos(0);
    setIniciado(false);
    setModalRegistrar(false);
    localStorage.removeItem("cronometro_pioneiro");
  }

  async function salvarAtividade() {
    setSalvando(true);
    const totalMinutos = Math.floor(segundos / 60);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    await pioneiroApi.entities.Atividade.create({
      data: format(new Date(), "yyyy-MM-dd"),
      horas,
      minutos,
      revisitas: form.revisitas,
      publicacoes: form.publicacoes,
      videos: form.videos,
      estudos: form.estudos,
      observacoes: form.observacoes,
    });
    toast.success(`Atividade registrada! ${horas}h${minutos > 0 ? ` ${minutos}min` : ""}`);
    descartar();
    setSalvando(false);
    setForm({ revisitas: 0, publicacoes: 0, videos: 0, estudos: 0, observacoes: "" });
  }

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);

  return (
    <>
      <div className={cn(
        "rounded-2xl p-4 border transition-all",
        rodando ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", rodando ? "bg-white/20" : "bg-muted")}>
              <Timer size={18} className={rodando ? "text-primary-foreground" : "text-primary"} />
            </div>
            <div>
              <p className={cn("text-xs font-medium", rodando ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {rodando ? "Em campo" : iniciado ? "Pausado" : "CronÃ´metro"}
              </p>
              <p className={cn("text-2xl font-bold font-mono tracking-wider", rodando ? "text-primary-foreground" : "text-foreground")}>
                {formatarTempo(segundos)}
              </p>
              {segundos > 0 && (
                <p className={cn("text-[10px] mt-0.5", rodando ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {horas > 0 ? `${horas}h ${minutos}min` : `${minutos} minuto${minutos !== 1 ? "s" : ""}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {iniciado && (
              <>
                {/* BotÃ£o registrar */}
                <button
                  onClick={abrirRegistrar}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold transition-all",
                    rodando ? "bg-white/20 hover:bg-white/30 text-primary-foreground" : "bg-emerald-500 text-white"
                  )}
                >
                  <CheckCircle2 size={13} />
                  Registrar
                </button>
                {/* BotÃ£o descartar */}
                <button
                  onClick={descartar}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                    rodando ? "bg-white/20" : "bg-muted"
                  )}
                >
                  <X size={14} className={rodando ? "text-primary-foreground" : "text-muted-foreground"} />
                </button>
              </>
            )}
            <button
              onClick={iniciarPausar}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
                rodando ? "bg-white/20 hover:bg-white/30" : "bg-primary"
              )}
            >
              {rodando
                ? <Pause size={16} className="text-primary-foreground" />
                : <Play size={16} className="text-primary-foreground ml-0.5" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Modal Registrar */}
      {modalRegistrar && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end justify-center">
          <div className="bg-card w-full max-w-md rounded-t-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Registrar Atividade</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tempo: <span className="font-semibold text-primary">{formatarTempo(segundos)}</span>
                </p>
              </div>
              <button onClick={() => setModalRegistrar(false)} className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
                <X size={15} />
              </button>
            </div>

            {/* Campos numÃ©ricos */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "revisitas", label: "Revisitas", emoji: "ðŸ”„" },
                { key: "estudos", label: "Estudos", emoji: "ðŸ“–" },
                { key: "publicacoes", label: "PublicaÃ§Ãµes", emoji: "ðŸ“°" },
                { key: "videos", label: "VÃ­deos", emoji: "â–¶ï¸" },
              ].map(({ key, label, emoji }) => (
                <div key={key} className="bg-muted rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-2">{emoji} {label}</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setForm(f => ({ ...f, [key]: Math.max(0, f[key] - 1) }))}
                      className="w-7 h-7 bg-background rounded-lg text-foreground font-bold text-base flex items-center justify-center"
                    >âˆ’</button>
                    <span className="text-lg font-bold text-foreground">{form[key]}</span>
                    <button
                      onClick={() => setForm(f => ({ ...f, [key]: f[key] + 1 }))}
                      className="w-7 h-7 bg-background rounded-lg text-foreground font-bold text-base flex items-center justify-center"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* ObservaÃ§Ãµes */}
            <textarea
              value={form.observacoes}
              onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
              placeholder="ObservaÃ§Ãµes do dia... (opcional)"
              rows={2}
              className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />

            <div className="flex gap-3">
              <button onClick={descartar} className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl text-sm font-medium">
                Descartar
              </button>
              <button onClick={salvarAtividade} disabled={salvando} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
