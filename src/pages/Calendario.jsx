import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { Plus, CalendarDays } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import MiniCalendario from "@/components/calendario/MiniCalendario";
import SemanaVisitas from "@/components/calendario/SemanaVisitas";
import FormVisita from "@/components/calendario/FormVisita";

export default function Calendario() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [visitaEditar, setVisitaEditar] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(format(new Date(), "yyyy-MM-dd"));
  const [modo, setModo] = useState("semana");

  async function carregar() {
    const user = await pioneiroApi.auth.me();
    const lista = await pioneiroApi.entities.VisitaAgendada.filter(
      { created_by: user.email },
      "data",
      300
    );
    setVisitas(lista);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  function visitasDaSemana() {
    const hoje = new Date();
    const ini = startOfWeek(hoje, { weekStartsOn: 0 });
    const fim = endOfWeek(hoje, { weekStartsOn: 0 });
    return visitas.filter(v => {
      const d = parseISO(v.data);
      return isWithinInterval(d, { start: ini, end: fim });
    });
  }

  function visitasDoDia() {
    return visitas.filter(v => v.data === diaSelecionado);
  }

  const visitasExibidas = modo === "semana" ? visitasDaSemana() : visitasDoDia();

  const totalSemana = visitasDaSemana().length;
  const concluidasSemana = visitasDaSemana().filter(v => v.concluida).length;

  function abrirForm(visita = null) {
    setVisitaEditar(visita);
    setMostrarForm(true);
  }

  function fecharForm() {
    setMostrarForm(false);
    setVisitaEditar(null);
  }

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
          <h1 className="text-2xl font-bold text-foreground">CalendÃ¡rio</h1>
          <p className="text-sm text-muted-foreground">
            {totalSemana > 0
              ? `${concluidasSemana}/${totalSemana} visitas esta semana`
              : "Nenhuma visita esta semana"}
          </p>
        </div>
        <button
          onClick={() => abrirForm()}
          className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={20} className="text-primary-foreground" />
        </button>
      </div>

      <MiniCalendario
        visitas={visitas}
        diaSelecionado={diaSelecionado}
        onSelecionarDia={d => {
          setDiaSelecionado(d);
          setModo("dia");
        }}
      />

      <div className="flex gap-2">
        <button
          onClick={() => setModo("semana")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            modo === "semana" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setModo("dia")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            modo === "dia" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {format(parseISO(diaSelecionado), "d 'de' MMM", { locale: ptBR })}
        </button>
      </div>

      <SemanaVisitas
        visitas={visitasExibidas}
        onAtualizar={carregar}
        onEditar={v => abrirForm(v)}
      />

      {mostrarForm && (
        <FormVisita
          visita={visitaEditar}
          dataInicial={modo === "dia" ? diaSelecionado : format(new Date(), "yyyy-MM-dd")}
          onSalvo={() => { fecharForm(); carregar(); }}
          onFechar={fecharForm}
        />
      )}
    </div>
  );
}
