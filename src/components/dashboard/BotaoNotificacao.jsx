import React, { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

export default function BotaoNotificacao() {
  const [permissao, setPermissao] = useState("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermissao(Notification.permission);
    }
  }, []);

  async function ativarNotificacoes() {
    if (!("Notification" in window)) {
      toast.error("Seu navegador nÃ£o suporta notificaÃ§Ãµes.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermissao(result);

    if (result === "granted") {
      agendarNotificacoes();
      toast.success("NotificaÃ§Ãµes ativadas! VocÃª receberÃ¡ lembretes diÃ¡rios.");
    } else {
      toast.error("PermissÃ£o negada para notificaÃ§Ãµes.");
    }
  }

  function agendarNotificacoes() {
    // Lembrete diÃ¡rio Ã s 20h
    agendarLembrete("Registrar atividades", "NÃ£o esqueÃ§a de registrar suas horas de pregaÃ§Ã£o de hoje! ðŸ“–", 20, 0);
    // Lembrete semanal (sexta-feira) Ã s 19h
    agendarLembretesSemanal();
  }

  function agendarLembrete(titulo, corpo, hora, minuto) {
    const agora = new Date();
    const lembrete = new Date();
    lembrete.setHours(hora, minuto, 0, 0);
    if (lembrete <= agora) lembrete.setDate(lembrete.getDate() + 1);
    const delay = lembrete - agora;

    setTimeout(() => {
      new Notification(titulo, {
        body: corpo,
        icon: "/icon-192.svg",
        badge: "/icon-192.svg",
        tag: "lembrete-pioneiro",
      });
      // Reagendar para o prÃ³ximo dia
      setInterval(() => {
        new Notification(titulo, { body: corpo, icon: "/icon-192.svg", tag: "lembrete-pioneiro" });
      }, 24 * 60 * 60 * 1000);
    }, delay);
  }

  function agendarLembretesSemanal() {
    const agora = new Date();
    const diasParaSexta = (5 - agora.getDay() + 7) % 7 || 7;
    const proxSexta = new Date(agora);
    proxSexta.setDate(agora.getDate() + diasParaSexta);
    proxSexta.setHours(19, 0, 0, 0);
    const delay = proxSexta - agora;

    setTimeout(() => {
      new Notification("Resumo semanal", {
        body: "Como foram suas atividades esta semana? Registre tudo antes do fim de semana! ðŸ™Œ",
        icon: "/icon-192.svg",
        tag: "lembrete-semanal",
      });
      setInterval(() => {
        new Notification("Resumo semanal", {
          body: "Como foram suas atividades esta semana? Registre tudo antes do fim de semana! ðŸ™Œ",
          icon: "/icon-192.svg",
          tag: "lembrete-semanal",
        });
      }, 7 * 24 * 60 * 60 * 1000);
    }, delay);
  }

  if (permissao === "granted") {
    return (
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
        <Bell size={14} className="text-green-600" />
        <span className="text-xs text-green-700 dark:text-green-300 font-medium">Lembretes ativos</span>
      </div>
    );
  }

  return (
    <button
      onClick={ativarNotificacoes}
      className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-all active:scale-95"
    >
      <BellOff size={14} />
      <span>Ativar lembretes</span>
    </button>
  );
}
