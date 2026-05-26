import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { getNomesMeses, getUltimosMeses, calcularAtividadesMes, calcularTotalHoras } from "@/lib/utils-pioneiro";

export default function GraficoMeses({ atividades, metaMes }) {
  const meses = getUltimosMeses(6);
  const nomes = getNomesMeses();

  const dados = meses.map(mes => {
    const [ano, m] = mes.split("-");
    const ativsMes = calcularAtividadesMes(atividades, mes);
    const total = calcularTotalHoras(ativsMes);
    return {
      mes: nomes[parseInt(m) - 1].slice(0, 3),
      horas: parseFloat(total.toFixed(1)),
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-sm font-bold text-blue-500">{payload[0].value}h</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">EvoluÃ§Ã£o â€” Ãšltimos 6 meses</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary inline-block" /> Horas</span>
          <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-dashed border-muted-foreground inline-block" /> Meta</span>
          <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-blue-400 inline-block" /> TendÃªncia</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={dados} barSize={26}>
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 8 }} />
          <ReferenceLine y={metaMes} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1.5} />
          <Bar dataKey="horas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          <Line type="monotone" dataKey="horas" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
