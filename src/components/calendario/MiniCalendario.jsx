import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MiniCalendario({ visitas, diaSelecionado, onSelecionarDia }) {
  const [mesAtual, setMesAtual] = useState(new Date());

  const inicio = startOfWeek(startOfMonth(mesAtual), { weekStartsOn: 0 });
  const fim = endOfWeek(endOfMonth(mesAtual), { weekStartsOn: 0 });

  const diasComVisita = new Set(
    visitas.filter(v => !v.concluida).map(v => v.data)
  );

  const dias = [];
  let d = inicio;
  while (d <= fim) {
    dias.push(d);
    d = addDays(d, 1);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* Nav mÃªs */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMesAtual(m => subMonths(m, 1))} className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-foreground capitalize">
          {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
        </p>
        <button onClick={() => setMesAtual(m => addMonths(m, 1))} className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* CabeÃ§alho dias */}
      <div className="grid grid-cols-7 mb-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Grid dias */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {dias.map((dia, idx) => {
          const str = format(dia, "yyyy-MM-dd");
          const temVisita = diasComVisita.has(str);
          const selecionado = diaSelecionado && isSameDay(dia, parseISO(diaSelecionado));
          const hoje = isToday(dia);
          const mesCorreto = isSameMonth(dia, mesAtual);

          return (
            <button
              key={idx}
              onClick={() => onSelecionarDia(str)}
              className={cn(
                "relative flex flex-col items-center justify-center h-9 rounded-xl transition-all text-sm",
                !mesCorreto && "opacity-25",
                selecionado && "bg-primary text-primary-foreground",
                !selecionado && hoje && "bg-primary/10 text-primary font-bold",
                !selecionado && !hoje && "hover:bg-muted text-foreground"
              )}
            >
              {format(dia, "d")}
              {temVisita && !selecionado && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
