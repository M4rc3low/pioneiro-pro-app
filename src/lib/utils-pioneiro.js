import { format, startOfMonth, endOfMonth, startOfYear, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";

export function getMesAtual() {
  return format(new Date(), "yyyy-MM");
}

export function getNomesMeses() {
  return [
    "Janeiro", "Fevereiro", "MarÃ§o", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
}

export function getMesNome(mesStr) {
  if (!mesStr) return "";
  const [ano, mes] = mesStr.split("-");
  const meses = getNomesMeses();
  return `${meses[parseInt(mes) - 1]} ${ano}`;
}

export function calcularTotalHoras(atividades) {
  return atividades.reduce((acc, a) => acc + (a.horas || 0) + (a.minutos || 0) / 60, 0);
}

export function calcularAtividadesMes(atividades, mes) {
  return atividades.filter(a => a.data && a.data.startsWith(mes));
}

export function calcularAtividadesAno(atividades, mesInicioAno = 9) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  let anoInicio, mesInicio;
  if (mesAtual >= mesInicioAno) {
    anoInicio = anoAtual;
  } else {
    anoInicio = anoAtual - 1;
  }

  return atividades.filter(a => {
    if (!a.data) return false;
    const dataAtividade = new Date(a.data);
    const inicio = new Date(anoInicio, mesInicioAno - 1, 1);
    const fim = new Date(anoInicio + 1, mesInicioAno - 1, 1);
    return dataAtividade >= inicio && dataAtividade < fim;
  });
}

export function formatarHoras(totalHoras) {
  const horas = Math.floor(totalHoras);
  const minutos = Math.round((totalHoras - horas) * 60);
  if (minutos === 0) return `${horas}h`;
  return `${horas}h ${minutos}min`;
}

export function getUltimosMeses(quantidade = 6) {
  const meses = [];
  const hoje = new Date();
  for (let i = quantidade - 1; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push(format(data, "yyyy-MM"));
  }
  return meses;
}
