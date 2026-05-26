import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

function calcularRitmoDiario(feitas, meta, diasRestantes) {
  const faltam = Math.max(meta - feitas, 0);
  if (diasRestantes <= 0 || faltam === 0) return null;
  return faltam / diasRestantes;
}

function formatarRitmo(horas) {
  if (horas === null) return "â€”";
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (h === 0 && m === 0) return "Meta atingida!";
  if (h === 0) return `${m}min/dia`;
  if (m === 0) return `${h}h/dia`;
  return `${h}h ${m}min/dia`;
}

export default function CardRitmo({ horasMes, metaMes, horasAno, metaAno, mesInicioAno = 9 }) {
  const hoje = new Date();
  
  // Dias restantes no mÃªs
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRestantesMes = ultimoDiaMes - hoje.getDate(); // exclui hoje
  
  // Dias restantes no ano de serviÃ§o
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  let fimAno;
  if (mesAtual >= mesInicioAno) {
    fimAno = new Date(anoAtual + 1, mesInicioAno - 1, 1);
  } else {
    fimAno = new Date(anoAtual, mesInicioAno - 1, 1);
  }
  const diasRestantesAno = Math.max(0, Math.ceil((fimAno - hoje) / (1000 * 60 * 60 * 24)));

  const ritmoDia = calcularRitmoDiario(horasMes, metaMes, diasRestantesMes);
  const ritmoAno = calcularRitmoDiario(horasAno, metaAno, diasRestantesAno);

  const metaMesAtingida = horasMes >= metaMes;
  const metaAnoAtingida = horasAno >= metaAno;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Flame size={16} className="text-orange-500" />
        <p className="text-sm font-semibold text-foreground">Ritmo necessÃ¡rio</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Por dia - para fechar o mÃªs */}
        <div className="bg-orange-50 dark:bg-orange-950/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wide mb-1">Por dia</p>
          {metaMesAtingida ? (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">âœ“ Meta!</p>
          ) : diasRestantesMes === 0 ? (
            <p className="text-xs font-bold text-red-500">Hoje!</p>
          ) : (
            <p className="text-sm font-bold text-orange-700 dark:text-orange-300 leading-tight">
              {formatarRitmo(ritmoDia)}
            </p>
          )}
          {!metaMesAtingida && diasRestantesMes > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{diasRestantesMes} dias</p>
          )}
        </div>

        {/* Por mÃªs - para fechar o ano */}
        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-1">Por mÃªs</p>
          {metaMesAtingida ? (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">âœ“ Meta!</p>
          ) : (
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 leading-tight">
              {formatarHorasSimples(Math.max(metaMes - horasMes, 0))}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-0.5">faltam este mÃªs</p>
        </div>

        {/* Ritmo pro ano */}
        <div className="bg-green-50 dark:bg-green-950/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-green-600 dark:text-green-400 font-medium uppercase tracking-wide mb-1">No ano</p>
          {metaAnoAtingida ? (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">âœ“ Meta!</p>
          ) : (
            <p className="text-sm font-bold text-green-700 dark:text-green-300 leading-tight">
              {formatarHorasSimples(Math.max(metaAno - horasAno, 0))}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-0.5">faltam no ano</p>
        </div>
      </div>

      {/* Texto explicativo */}
      {!metaMesAtingida && diasRestantesMes > 0 && ritmoDia !== null && (
        <p className="text-xs text-muted-foreground text-center">
          Pregue <span className="font-semibold text-orange-600 dark:text-orange-400">{formatarRitmo(ritmoDia)}</span> pelos prÃ³ximos {diasRestantesMes} dias para fechar o mÃªs
        </p>
      )}
    </div>
  );
}

function formatarHorasSimples(totalHoras) {
  const h = Math.floor(totalHoras);
  const m = Math.round((totalHoras - h) * 60);
  if (h === 0 && m === 0) return "0h";
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
