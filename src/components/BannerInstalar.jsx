import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

export default function BannerInstalar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visivel, setVisivel] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [mostrarIOSInstrucoes, setMostrarIOSInstrucoes] = useState(false);

  useEffect(() => {
    // Verifica se jÃ¡ estÃ¡ instalado
    const jaInstalado =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (jaInstalado) return;

    // Verifica se jÃ¡ dispensou
    const dispensado = localStorage.getItem("banner_instalar_dispensado");
    if (dispensado) return;

    // Detecta iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      setVisivel(true);
      return;
    }

    // Android / Desktop â€” captura evento beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisivel(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function instalar() {
    if (isIOS) {
      setMostrarIOSInstrucoes(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisivel(false);
    setDeferredPrompt(null);
  }

  function dispensar() {
    localStorage.setItem("banner_instalar_dispensado", "1");
    setVisivel(false);
    setMostrarIOSInstrucoes(false);
  }

  if (!visivel) return null;

  return (
    <>
      {/* Banner principal */}
      <div className="mx-4 mb-3 bg-primary text-primary-foreground rounded-2xl p-3.5 flex items-center gap-3 shadow-lg">
        <div className="w-9 h-9 bg-primary-foreground/20 rounded-xl flex items-center justify-center shrink-0">
          <Smartphone size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Instale o app!</p>
          <p className="text-xs opacity-80 mt-0.5">
            {isIOS ? "Abra no Safari e adicione Ã  tela de inÃ­cio" : "Acesse sem a barra do navegador"}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={instalar}
            className="bg-primary-foreground text-primary text-xs font-semibold px-3 py-1.5 rounded-xl"
          >
            {isIOS ? "Como?" : "Instalar"}
          </button>
          <button onClick={dispensar} className="w-7 h-7 flex items-center justify-center opacity-70">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* InstruÃ§Ãµes iOS */}
      {mostrarIOSInstrucoes && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={dispensar}>
          <div
            className="bg-card w-full rounded-t-3xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-foreground">Instalar no iPhone / iPad</p>
              <button onClick={dispensar}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { num: "1", txt: 'Abra este site no app Safari (nÃ£o Chrome ou outro)' },
                { num: "2", txt: 'Toque no Ã­cone de compartilhar (quadrado com seta â†‘) na barra inferior' },
                { num: "3", txt: 'Role para baixo e toque em "Adicionar Ã  Tela de InÃ­cio"' },
                { num: "4", txt: 'Toque em "Adicionar" no canto superior direito' },
              ].map(({ num, txt }) => (
                <div key={num} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{num}</span>
                  <p className="text-sm text-foreground">{txt}</p>
                </div>
              ))}
            </div>
            <button
              onClick={dispensar}
              className="w-full bg-primary text-primary-foreground py-3 rounded-2xl text-sm font-semibold mt-2"
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
