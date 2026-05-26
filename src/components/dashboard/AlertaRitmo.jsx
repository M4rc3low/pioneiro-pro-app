import React from "react";
import { AlertTriangle, TrendingDown, CheckCircle2, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AlertaRitmo({ horasMes, metaMes }) {
  const hoje = new Date();
  const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diaAtual = hoje.getDate();
  const diasRestantes = diasNoMes - diaAtual;

  // Ritmo esperado: proporÃ§Ã£o do mÃªs que jÃ¡ passou
  const proporcaoPassada = diaAtual / diasNoMes;
  const horasEsperadas = metaMes * proporcaoPassada;
  const deficit = horasEsperadas - horasMes;
  const pct = Math.min((horasMes / metaMes) * 100, 100);

  // Horas/dia necessÃ¡rias para fechar a meta
  const faltamHoras = Math.max(metaMes - horasMes, 0);
  const hPorDia = diasRestantes > 0 ? (faltamHoras / diasRestantes).toFixed(1) : 0;

  // Alerta de prazo final: menos de 5 dias e meta nÃ£o atingida
  const alertaUrgente = diasRestantes < 5 && pct < 100;

  // Determina nÃ­vel de alerta
  let nivel = "ok"; // ok, atencao, critico
  if (pct >= 100) nivel = "completo";
  else if (alertaUrgente || deficit > metaMes * 0.2) nivel = "critico";
  else if (deficit > metaMes * 0.05) nivel = "atencao";

  const config = {
    ok: {
      bg: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
      texto: "text-emerald-700 dark:text-emerald-300",
      icone: CheckCircle2,
      iconeCor: "text-emerald-500",
      titulo: "VocÃª estÃ¡ no ritmo certo!",
      msg: `Continue assim. NecessÃ¡rio ${hPorDia}h/dia para garantir a meta.`,
    },
    atencao: {
      bg: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
      texto: "text-amber-700 dark:text-amber-300",
      icone: Zap,
      iconeCor: "text-amber-500",
      titulo: "AtenÃ§Ã£o ao ritmo!",
      msg: `VocÃª estÃ¡ um pouco abaixo. Precisa de ${hPorDia}h/dia nos prÃ³ximos ${diasRestantes} dias.`,
    },
    critico: {
      bg: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
      texto: "text-red-700 dark:text-red-300",
      icone: alertaUrgente ? Clock : TrendingDown,
      iconeCor: "text-red-500",
      titulo: alertaUrgente
        ? `âš ï¸ Restam apenas ${diasRestantes} dia${diasRestantes === 1 ? "" : "s"} para fechar o mÃªs!`
        : "Ritmo abaixo do necessÃ¡rio!",
      msg: alertaUrgente
        ? `Faltam ${faltamHoras.toFixed(1)}h para sua meta. Registre suas horas agora!`
        : `Precisa de ${hPorDia}h/dia nos prÃ³ximos ${diasRestantes} dias para atingir a meta.`,
    },
    completo: {
      bg: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
      texto: "text-emerald-700 dark:text-emerald-300",
      icone: CheckCircle2,
      iconeCor: "text-emerald-500",
      titulo: "Meta do mÃªs atingida! ðŸŽ‰",
      msg: "ParabÃ©ns! VocÃª completou sua meta mensal.",
    },
  };

  const { bg, texto, icone: Icone, iconeCor, titulo, msg } = config[nivel];

  // Cor da barra baseada no nÃ­vel
  const corBarra = {
    ok: "bg-emerald-500",
    atencao: "bg-amber-500",
    critico: "bg-red-500",
    completo: "bg-emerald-500",
  }[nivel];

  return (
    <div className={cn("rounded-2xl p-4 border", bg)}>
      <div className="flex gap-3 items-start mb-3">
        <Icone size={18} className={cn("mt-0.5 shrink-0", iconeCor)} />
        <div>
          <p className={cn("text-sm font-semibold", texto)}>{titulo}</p>
          <p className={cn("text-xs mt-0.5", texto, "opacity-80")}>{msg}</p>
        </div>
      </div>
      {/* Barra de progresso com cor dinÃ¢mica */}
      <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all duration-700", corBarra)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className={cn("text-xs opacity-70", texto)}>{Math.round(pct)}% da meta</span>
        <span className={cn("text-xs opacity-70", texto)}>{diasRestantes} dias restantes</span>
      </div>
    </div>
  );
}
