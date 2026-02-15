import { useEffect, useState } from "react";
import { GeoLensButton } from "./GeoLensButton";
import { GeoLensModal } from "./GeoLensModal";
import { WorldMap } from "./WorldMap";
import { CountryPanel } from "./CountryPanel";
import { countryAggRepo } from "../../storage/indexedDbRepos";
import { log } from "../../core/logger";
import { ui } from "./styles";

type GeoJSONFeatureCollection = any; 

export function GeoLensOverlay() {
  const [open, setOpen] = useState(false);
  const [geojson, setGeojson] = useState<GeoJSONFeatureCollection | null>(null);

  const [selected, setSelected] = useState<{ code: string; name: string } | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    // load geojson once
    (async () => {
      try {
        const url = chrome.runtime.getURL("build/assets/geolens_countries.json");
        const res = await fetch(url);
        const json = await res.json();
        setGeojson(json);
        log.info("GeoLens geojson loaded");
      } catch (e) {
        log.error("Failed to load GeoLens geojson:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) {
      setStats(null);
      return;
    }

    (async () => {
      setLoadingStats(true);
      try {
        const agg = await countryAggRepo.get(selected.code.toLowerCase());
        setStats(agg ?? null);
      } catch (e) {
        log.error("Failed to load country stats:", e);
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [selected]);

  return (
    <>
      <GeoLensButton onClick={() => setOpen(true)} />

      <GeoLensModal open={open} onClose={() => setOpen(false)} title="GeoLens">
        <div style={ui.overlayBody}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {!geojson ? (
              <div style={{ padding: 16, color: "white", opacity: 0.8 }}>Loading map…</div>
            ) : (
              <WorldMap
                geojson={geojson}
                selectedCode={selected?.code ?? null}
                onSelect={(c) => setSelected(c)}
              />
            )}
          </div>

          <CountryPanel selected={selected} loading={loadingStats} stats={stats} />
        </div>
      </GeoLensModal>
    </>
  );
}
