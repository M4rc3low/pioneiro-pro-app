import { useState } from "react";
import { pioneiroApi } from "@/api/pioneiroClient";
import { Navigation, MapPin, Loader2, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

// FÃ³rmula de Haversine para distÃ¢ncia em km
function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Geocodificar endereÃ§o usando Nominatim (OpenStreetMap, gratuito)
async function geocodificar(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
  const data = await res.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }
  return null;
}

export default function SugerirVisitas() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sugestoes, setSugestoes] = useState(null);
  const [aberto, setAberto] = useState(false);

  async function buscarSugestoes() {
    setLoading(true);
    setErro("");
    setSugestoes(null);
    setAberto(true);

    // 1. Pegar localizaÃ§Ã£o do usuÃ¡rio via GPS
    let posicao;
    try {
      posicao = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
    } catch {
      setErro("NÃ£o foi possÃ­vel obter sua localizaÃ§Ã£o. Verifique as permissÃµes de GPS.");
      setLoading(false);
      return;
    }

    const { latitude, longitude } = posicao.coords;

    // 2. Buscar estudantes ativos com endereÃ§o
    const user = await pioneiroApi.auth.me();
    const estudantes = await pioneiroApi.entities.Estudante.filter(
      { created_by: user.email, status: "ativo" },
      "nome",
      100
    );

    const comEndereco = estudantes.filter(e => e.endereco && e.endereco.trim().length > 5);

    if (comEndereco.length === 0) {
      setErro("Nenhum estudante ativo com endereÃ§o cadastrado. Adicione endereÃ§os no cadastro dos estudantes.");
      setLoading(false);
      return;
    }

    // 3. Geocodificar endereÃ§os e calcular distÃ¢ncias
    const resultados = [];
    for (const est of comEndereco) {
      const coords = await geocodificar(est.endereco);
      if (coords) {
        const dist = distanciaKm(latitude, longitude, coords.lat, coords.lon);
        resultados.push({ ...est, dist: dist.toFixed(1), coords });
      }
    }

    if (resultados.length === 0) {
      setErro("NÃ£o foi possÃ­vel localizar os endereÃ§os dos estudantes no mapa.");
      setLoading(false);
      return;
    }

    // 4. Ordenar por proximidade
    resultados.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
    setSugestoes(resultados.slice(0, 8));
    setLoading(false);
  }

  const horarioLabel = { manha: "ManhÃ£", tarde: "Tarde", noite: "Noite" };

  return (
    <>
      {/* BotÃ£o de acionar */}
      <button
        onClick={buscarSugestoes}
        disabled={loading}
        className="w-full flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <Navigation size={16} className="text-blue-600 dark:text-blue-300" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Sugerir Visitas</p>
            <p className="text-xs text-muted-foreground">Estudantes mais prÃ³ximos de vocÃª</p>
          </div>
        </div>
        {loading
          ? <Loader2 size={16} className="text-muted-foreground animate-spin" />
          : <ChevronRight size={16} className="text-muted-foreground" />
        }
      </button>

      {/* Painel de resultados */}
      {aberto && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end justify-center">
          <div className="bg-card w-full max-w-md rounded-t-3xl p-5 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-blue-500" />
                <h3 className="text-base font-bold text-foreground">Visitas Sugeridas</h3>
              </div>
              <button onClick={() => setAberto(false)} className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
                <X size={15} />
              </button>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={28} className="text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Calculando proximidade...</p>
              </div>
            )}

            {erro && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{erro}</p>
              </div>
            )}

            {sugestoes && (
              <div className="overflow-y-auto space-y-2 flex-1">
                <p className="text-xs text-muted-foreground mb-3">
                  Ordenados por proximidade da sua localizaÃ§Ã£o atual
                </p>
                {sugestoes.map((est, idx) => (
                  <div key={est.id} className="bg-muted/50 rounded-2xl p-3.5 flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                      idx === 0 ? "bg-amber-400 text-white" :
                      idx === 1 ? "bg-slate-400 text-white" :
                      idx === 2 ? "bg-orange-400 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{est.nome}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin size={10} className="text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">{est.endereco}</p>
                      </div>
                      {est.horario_preferido && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          â° {horarioLabel[est.horario_preferido]}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-blue-500">{est.dist} km</p>
                      <p className="text-[10px] text-muted-foreground">de distÃ¢ncia</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
