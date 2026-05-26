import { useState } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function FormEstudante({ estudante, onSalvo, onCancelar }) {
  const [form, setForm] = useState({
    nome: estudante?.nome || "",
    telefone: estudante?.telefone || "",
    endereco: estudante?.endereco || "",
    modalidade: estudante?.modalidade || "presencial",
    horario_preferido: estudante?.horario_preferido || "tarde",
    publicacao_atual: estudante?.publicacao_atual || "",
    licao_atual: estudante?.licao_atual || "",
    historico: estudante?.historico || "",
    status: estudante?.status || "ativo",
    data_inicio: estudante?.data_inicio || "",
  });
  const [salvando, setSalvando] = useState(false);

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  async function salvar() {
    if (!form.nome.trim()) { toast.error("Informe o nome do estudante."); return; }
    setSalvando(true);
    if (estudante?.id) {
      await pioneiroApi.entities.Estudante.update(estudante.id, form);
    } else {
      await pioneiroApi.entities.Estudante.create(form);
    }
    toast.success(estudante ? "Estudante atualizado!" : "Estudante adicionado!");
    onSalvo();
  }

  const campo = (label, campo, tipo = "text", placeholder = "") => (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      <input
        type={tipo}
        value={form[campo]}
        onChange={e => set(campo, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );

  const select = (label, campo, opcoes) => (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      <select
        value={form[campo]}
        onChange={e => set(campo, e.target.value)}
        className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
      >
        {opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onCancelar} className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{estudante ? "Editar Estudante" : "Novo Estudante"}</h1>
        </div>
      </div>

      {campo("Nome completo *", "nome", "text", "Nome do estudante")}
      {campo("Telefone / WhatsApp", "telefone", "tel", "(00) 00000-0000")}
      {campo("EndereÃ§o", "endereco", "text", "Rua, nÃºmero, bairro")}
      {campo("Data de inÃ­cio", "data_inicio", "date")}

      <div className="grid grid-cols-2 gap-3">
        {select("Modalidade", "modalidade", [
          { value: "presencial", label: "Presencial" },
          { value: "online", label: "Online" },
        ])}
        {select("HorÃ¡rio preferido", "horario_preferido", [
          { value: "manha", label: "ManhÃ£" },
          { value: "tarde", label: "Tarde" },
          { value: "noite", label: "Noite" },
        ])}
      </div>

      {campo("PublicaÃ§Ã£o em estudo", "publicacao_atual", "text", "Ex: Ensine-nos a Orar")}
      {campo("LiÃ§Ã£o / CapÃ­tulo atual", "licao_atual", "text", "Ex: LiÃ§Ã£o 5")}

      {select("Status", "status", [
        { value: "ativo", label: "Ativo" },
        { value: "pausado", label: "Pausado" },
        { value: "encerrado", label: "Encerrado" },
      ])}

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">HistÃ³rico e observaÃ§Ãµes</label>
        <textarea
          value={form.historico}
          onChange={e => set("historico", e.target.value)}
          placeholder="O que jÃ¡ estudou, pontos importantes, como conheceu a verdade..."
          rows={4}
          className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <button
        onClick={salvar}
        disabled={salvando}
        className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base active:scale-95 transition-all disabled:opacity-60"
      >
        {salvando ? "Salvando..." : "Salvar Estudante"}
      </button>
    </div>
  );
}
