import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { Copy, CheckCircle2, MessageCircle, Download, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { getMesNome, getUltimosMeses, calcularAtividadesMes, calcularTotalHoras } from "@/lib/utils-pioneiro";
import { cn } from "@/lib/utils";

function nomeArquivoSeguro(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function CampoNumero({ label, valor, onChange }) {
  return (
    <div className="bg-muted rounded-xl p-3">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, Number(valor || 0) - 1))}
          className="w-8 h-8 rounded-lg bg-card text-foreground font-bold text-lg flex items-center justify-center"
        >
          −
        </button>
        <span className="flex-1 text-center text-lg font-bold text-foreground">{valor || 0}</span>
        <button
          type="button"
          onClick={() => onChange(Number(valor || 0) + 1)}
          className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}

function normalizarMinutos(horas, minutos) {
  const total = Math.max(0, Number(horas || 0) * 60 + Number(minutos || 0));
  return {
    horas: Math.floor(total / 60),
    minutos: total % 60,
  };
}

export default function Relatorios() {
  const [atividades, setAtividades] = useState([]);
  const [config, setConfig] = useState({ meta_horas_mes: 50, nome_pioneiro: "", congregacao: "" });
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [formEdicao, setFormEdicao] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const meses = getUltimosMeses(12);

  async function carregar() {
    setLoading(true);
    const user = await pioneiroApi.auth.me();
    const [ativs, configs] = await Promise.all([
      pioneiroApi.entities.Atividade.filter({ created_by: user.email }, "-data", 500),
      pioneiroApi.entities.Configuracao.filter({ created_by: user.email })
    ]);
    setAtividades(ativs);
    if (configs.length > 0) setConfig(prev => ({ ...prev, ...configs[0] }));
    setMesSelecionado(prev => {
      if (prev) return prev;
      return meses.slice().reverse().find(m => calcularAtividadesMes(ativs, m).length > 0) || meses[meses.length - 1];
    });
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const ativsMes = calcularAtividadesMes(atividades, mesSelecionado);
  const totalHoras = calcularTotalHoras(ativsMes);
  const horasInt = Math.floor(totalHoras);
  const minutos = Math.round((totalHoras - horasInt) * 60);
  const totalRevisitas = ativsMes.reduce((acc, a) => acc + (a.revisitas || 0), 0);
  const totalPublicacoes = ativsMes.reduce((acc, a) => acc + (a.publicacoes || 0), 0);
  const totalVideos = ativsMes.reduce((acc, a) => acc + (a.videos || 0), 0);
  const totalEstudos = ativsMes.reduce((acc, a) => acc + (a.estudos || 0), 0);

  const horasTexto = minutos > 0 ? `${horasInt}h ${minutos}min` : `${horasInt}h`;

  function abrirEdicao(atividade) {
    setEditando(atividade);
    setFormEdicao({
      data: atividade.data || "",
      horas: atividade.horas || 0,
      minutos: atividade.minutos || 0,
      revisitas: atividade.revisitas || 0,
      publicacoes: atividade.publicacoes || 0,
      videos: atividade.videos || 0,
      estudos: atividade.estudos || 0,
      observacoes: atividade.observacoes || atividade.detalhes || "",
    });
  }

  function fecharEdicao() {
    setEditando(null);
    setFormEdicao(null);
  }

  function setCampoEdicao(campo, valor) {
    setFormEdicao(prev => ({ ...prev, [campo]: valor }));
  }

  async function salvarEdicao() {
    if (!editando?.id || !formEdicao) return;
    if (!formEdicao.data) {
      toast.error("Informe a data da atividade.");
      return;
    }

    setSalvandoEdicao(true);
    try {
      const tempo = normalizarMinutos(formEdicao.horas, formEdicao.minutos);
      const dados = {
        ...formEdicao,
        horas: tempo.horas,
        minutos: tempo.minutos,
        revisitas: Number(formEdicao.revisitas || 0),
        publicacoes: Number(formEdicao.publicacoes || 0),
        videos: Number(formEdicao.videos || 0),
        estudos: Number(formEdicao.estudos || 0),
        observacoes: formEdicao.observacoes || "",
        detalhes: formEdicao.observacoes || "",
      };
      const atualizado = await pioneiroApi.entities.Atividade.update(editando.id, dados);
      setAtividades(prev => prev.map(a => a.id === editando.id ? atualizado : a));
      toast.success("Registro atualizado!");
      fecharEdicao();
    } catch (error) {
      console.error("Erro ao editar atividade:", error);
      toast.error(error.message || "Não foi possível editar o registro.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function excluirAtividade(atividade) {
    const confirmar = window.confirm("Excluir este registro do relatório? Essa ação não pode ser desfeita.");
    if (!confirmar) return;

    try {
      await pioneiroApi.entities.Atividade.delete(atividade.id);
      setAtividades(prev => prev.filter(a => a.id !== atividade.id));
      toast.success("Registro excluído.");
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
      toast.error(error.message || "Não foi possível excluir o registro.");
    }
  }

  function gerarTextoRelatorio() {
    const nome = config.nome_pioneiro || "[Seu Nome]";
    const congregacao = config.congregacao || "[Congregação]";
    const mes = getMesNome(mesSelecionado);

    return `📋 RELATÓRIO MENSAL - ${mes.toUpperCase()}
👤 ${nome}
🏛️ ${congregacao}

⏱️ Horas: ${horasTexto}
📖 Estudos bíblicos: ${totalEstudos}
🔄 Revisitas: ${totalRevisitas}
📚 Publicações: ${totalPublicacoes}
🎬 Vídeos: ${totalVideos}

Meta do mês: ${config.meta_horas_mes}h
${totalHoras >= config.meta_horas_mes ? "✅ Meta atingida!" : `⚠️ Faltaram ${Math.ceil(config.meta_horas_mes - totalHoras)}h para a meta`}`;
  }

  function copiar() {
    navigator.clipboard.writeText(gerarTextoRelatorio());
    setCopiado(true);
    toast.success("Relatório copiado!");
    setTimeout(() => setCopiado(false), 3000);
  }

  function enviarWhatsApp() {
    const texto = encodeURIComponent(gerarTextoRelatorio());
    window.open(`https://wa.me/?text=${texto}`, "_blank", "noopener,noreferrer");
  }

  function gerarPDF() {
    const doc = new jsPDF();
    const nome = config.nome_pioneiro || "Pioneiro";
    const congregacao = config.congregacao || "Congregação";
    const mes = getMesNome(mesSelecionado);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório Mensal", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Mês: ${mes}`, 20, 32);
    doc.text(`Nome: ${nome}`, 20, 40);
    doc.text(`Congregação: ${congregacao}`, 20, 48);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo", 20, 62);
    doc.setFont("helvetica", "normal");
    doc.text(`Horas: ${horasTexto}`, 20, 74);
    doc.text(`Estudos bíblicos: ${totalEstudos}`, 20, 82);
    doc.text(`Revisitas: ${totalRevisitas}`, 20, 90);
    doc.text(`Publicações: ${totalPublicacoes}`, 20, 98);
    doc.text(`Vídeos: ${totalVideos}`, 20, 106);
    doc.text(`Meta do mês: ${config.meta_horas_mes}h`, 20, 114);

    const statusMeta = totalHoras >= config.meta_horas_mes
      ? "Meta atingida"
      : `Faltaram ${Math.ceil(config.meta_horas_mes - totalHoras)}h para a meta`;
    doc.text(`Status: ${statusMeta}`, 20, 122);

    if (ativsMes.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Registros do mês", 20, 138);
      doc.setFont("helvetica", "normal");
      let y = 150;
      ativsMes.slice().sort((a, b) => b.data?.localeCompare(a.data)).forEach((a) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const data = a.data ? new Date(a.data + "T12:00").toLocaleDateString("pt-BR") : "—";
        const detalhes = a.observacoes || a.detalhes || "";
        doc.text(`${data} - ${a.horas || 0}h${a.minutos ? ` ${a.minutos}min` : ""} | ${a.revisitas || 0} rev | ${a.estudos || 0} est`, 20, y);
        y += 7;
        if (detalhes) {
          const linhas = doc.splitTextToSize(`Detalhes: ${detalhes}`, 170);
          doc.text(linhas, 20, y);
          y += linhas.length * 7;
        }
      });
    }

    const arquivo = `relatorio-${nomeArquivoSeguro(nome)}-${nomeArquivoSeguro(mes)}.pdf`;
    doc.save(arquivo);
    toast.success("PDF gerado com sucesso!");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Resumo mensal das suas atividades</p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Selecionar mês</label>
        <select value={mesSelecionado} onChange={e => setMesSelecionado(e.target.value)} className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30">
          {meses.slice().reverse().map(m => <option key={m} value={m}>{getMesNome(m)}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{getMesNome(mesSelecionado)}</h2>
          {totalHoras >= config.meta_horas_mes ? (
            <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">Meta atingida ✓</span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full font-medium">Meta não atingida</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-xl p-3"><p className="text-xs text-muted-foreground">Horas</p><p className="text-xl font-bold text-foreground">{horasTexto}</p><p className="text-xs text-muted-foreground">meta: {config.meta_horas_mes}h</p></div>
          <div className="bg-muted rounded-xl p-3"><p className="text-xs text-muted-foreground">Estudos bíblicos</p><p className="text-xl font-bold text-foreground">{totalEstudos}</p></div>
          <div className="bg-muted rounded-xl p-3"><p className="text-xs text-muted-foreground">Revisitas</p><p className="text-xl font-bold text-foreground">{totalRevisitas}</p></div>
          <div className="bg-muted rounded-xl p-3"><p className="text-xs text-muted-foreground">Publicações</p><p className="text-xl font-bold text-foreground">{totalPublicacoes}</p></div>
        </div>
      </div>

      <div className="bg-muted rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Preview do relatório</p>
        <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">{gerarTextoRelatorio()}</pre>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button onClick={enviarWhatsApp} className="w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-all active:scale-95 bg-emerald-500 text-white"><MessageCircle size={20} /> Enviar pelo WhatsApp</button>
        <button onClick={gerarPDF} className="w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-all active:scale-95 bg-card border border-border text-foreground"><Download size={20} /> Baixar PDF</button>
        <button onClick={copiar} className={cn("w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-all active:scale-95", copiado ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground")}>{copiado ? <><CheckCircle2 size={20} /> Copiado!</> : <><Copy size={20} /> Copiar texto</>}</button>
      </div>

      {ativsMes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Registros do mês ({ativsMes.length})</p>
          <div className="space-y-2">
            {ativsMes.slice().sort((a, b) => b.data?.localeCompare(a.data)).map(a => {
              const detalhes = a.observacoes || a.detalhes || "";
              return (
                <div key={a.id} className="bg-card border border-border rounded-xl px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.data ? new Date(a.data + "T12:00").toLocaleDateString("pt-BR") : "—"}</p>
                      <p className="text-xs text-muted-foreground">{a.horas || 0}h{a.minutos ? ` ${a.minutos}min` : ""} · {a.revisitas || 0} rev · {a.estudos || 0} est</p>
                    </div>
                    {detalhes && <div className="w-2 h-2 bg-primary rounded-full" title={detalhes} />}
                  </div>
                  {detalhes && <p className="text-xs text-muted-foreground bg-muted rounded-xl p-3">{detalhes}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => abrirEdicao(a)} className="flex-1 bg-muted text-foreground text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"><Pencil size={13} /> Editar</button>
                    <button onClick={() => excluirAtividade(a)} className="flex-1 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"><Trash2 size={13} /> Excluir</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editando && formEdicao && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end justify-center p-0">
          <div className="bg-card w-full max-w-md rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Editar registro</h3>
                <p className="text-xs text-muted-foreground">Corrija horas, minutos e detalhes lançados no relatório</p>
              </div>
              <button onClick={fecharEdicao} className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center"><X size={16} /></button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Data</label>
              <input type="date" value={formEdicao.data} onChange={e => setCampoEdicao("data", e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Horas</label>
                <input type="number" min="0" value={formEdicao.horas} onChange={e => setCampoEdicao("horas", Number(e.target.value))} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Minutos</label>
                <input type="number" min="0" value={formEdicao.minutos} onChange={e => setCampoEdicao("minutos", Number(e.target.value))} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <CampoNumero label="Revisitas" valor={formEdicao.revisitas} onChange={v => setCampoEdicao("revisitas", v)} />
              <CampoNumero label="Estudos" valor={formEdicao.estudos} onChange={v => setCampoEdicao("estudos", v)} />
              <CampoNumero label="Publicações" valor={formEdicao.publicacoes} onChange={v => setCampoEdicao("publicacoes", v)} />
              <CampoNumero label="Vídeos" valor={formEdicao.videos} onChange={v => setCampoEdicao("videos", v)} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Detalhes / observações</label>
              <textarea value={formEdicao.observacoes} onChange={e => setCampoEdicao("observacoes", e.target.value)} rows={4} placeholder="Ex.: esqueci de pausar o cronômetro, fiz 20 minutos a mais, detalhes da atividade..." className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={fecharEdicao} className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl text-sm font-medium">Cancelar</button>
              <button onClick={salvarEdicao} disabled={salvandoEdicao} className="flex-1 bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"><Save size={16} /> {salvandoEdicao ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
