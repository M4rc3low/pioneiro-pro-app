import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function BannerOffline({ isOnline, pendentes }) {
  if (isOnline && pendentes === 0) return null;

  return (
    <div className={`rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium ${
      !isOnline
        ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
        : "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
    }`}>
      {!isOnline ? (
        <>
          <WifiOff size={14} className="shrink-0" />
          <span>Sem conexÃ£o â€” atividades serÃ£o salvas localmente</span>
        </>
      ) : (
        <>
          <RefreshCw size={14} className="shrink-0 animate-spin" />
          <span>{pendentes} atividade(s) sendo sincronizada(s)...</span>
        </>
      )}
    </div>
  );
}
