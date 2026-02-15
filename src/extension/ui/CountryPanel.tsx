import { ui } from "./styles";

export function CountryPanel(props: {
  selected: { code: string; name: string } | null;
  loading: boolean;
  stats: any | null;
}) {
  return (
    <div style={ui.panel}>
      {!props.selected ? (
        <div style={{ opacity: 0.85, lineHeight: 1.4 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Country</div>
          <div style={{ marginTop: 8, opacity: 0.75 }}>
            Click a country on the map to view stats.
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{props.selected.name}</div>
          <div style={{ marginTop: 4, opacity: 0.8 }}>
            Code: <span style={{ fontWeight: 700 }}>{props.selected.code}</span>
          </div>

          <div style={{ marginTop: 14, fontWeight: 800 }}>Stats</div>

          {props.loading ? (
            <div style={{ marginTop: 10, opacity: 0.75 }}>Loading…</div>
          ) : !props.stats ? (
            <div style={{ marginTop: 10, opacity: 0.75 }}>No data yet.</div>
          ) : (
            <div style={{ marginTop: 10 }}>
              {Object.entries(props.stats).map(([k, v]) => (
                <div key={k} style={ui.cardRow}>
                  <div style={{ opacity: 0.85 }}>{k}</div>
                  <div style={{ fontWeight: 800, textAlign: "right" }}>
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
