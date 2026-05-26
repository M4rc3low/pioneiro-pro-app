import { useState, useEffect } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { toast } from "sonner";

const DB_NAME = "pioneiro-offline";
const STORE = "pendentes";

function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function salvarOffline(dados) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).add({ dados, timestamp: Date.now() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function lerPendentes() {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function removerPendente(id) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function sincronizarPendentes() {
  const pendentes = await lerPendentes();
  if (pendentes.length === 0) return;

  let sincronizados = 0;
  for (const item of pendentes) {
    try {
      await pioneiroApi.entities.Atividade.create(item.dados);
      await removerPendente(item.id);
      sincronizados++;
    } catch (_) {
      // MantÃ©m na fila
    }
  }

  if (sincronizados > 0) {
    toast.success(`${sincronizados} atividade(s) offline sincronizada(s)! âœ…`);
  }
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    async function atualizarContagem() {
      const p = await lerPendentes();
      setPendentes(p.length);
    }
    atualizarContagem();

    function aoFicarOnline() {
      setIsOnline(true);
      sincronizarPendentes().then(() => atualizarContagem());
    }

    function aoFicarOffline() {
      setIsOnline(false);
      toast.warning("Sem conexÃ£o. Atividades serÃ£o salvas localmente. ðŸ“´");
    }

    window.addEventListener("online", aoFicarOnline);
    window.addEventListener("offline", aoFicarOffline);
    return () => {
      window.removeEventListener("online", aoFicarOnline);
      window.removeEventListener("offline", aoFicarOffline);
    };
  }, []);

  async function criarAtividade(dados) {
    if (navigator.onLine) {
      await pioneiroApi.entities.Atividade.create(dados);
    } else {
      await salvarOffline(dados);
      setPendentes((p) => p + 1);
      toast.info("Atividade salva offline. SerÃ¡ sincronizada quando houver conexÃ£o. ðŸ“¥");
    }
  }

  return { isOnline, pendentes, criarAtividade };
}
