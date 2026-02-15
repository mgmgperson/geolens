import React, { useMemo } from "react";
import { ui } from "./styles";

// TODO: allow zooming, refactor country polygons and styles

type GeoJSONFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, any>;
    geometry:
      | { type: "Polygon"; coordinates: number[][][] }
      | { type: "MultiPolygon"; coordinates: number[][][][] };
  }>;
};

function projectEquirect(lon: number, lat: number, width: number, height: number) {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y] as const;
}

function polygonToPath(rings: number[][][], width: number, height: number): string {
  let d = "";
  for (const ring of rings) {
    if (!ring?.length) continue;

    const [x0, y0] = projectEquirect(ring[0][0], ring[0][1], width, height);
    d += `M ${x0} ${y0} `;
    for (let i = 1; i < ring.length; i++) {
      const [x, y] = projectEquirect(ring[i][0], ring[i][1], width, height);
      d += `L ${x} ${y} `;
    }
    d += "Z ";
  }
  return d.trim();
}

function featureToPath(
  feature: GeoJSONFeatureCollection["features"][number],
  width: number,
  height: number
): string {
  const g = feature.geometry;
  if (g.type === "Polygon") return polygonToPath(g.coordinates, width, height);
  return g.coordinates.map((poly) => polygonToPath(poly, width, height)).join(" ");
}

function getCountryCode(props: Record<string, any>): string | null {
  return (props.code ?? props.CODE ?? props.iso_a2 ?? props.ISO_A2 ?? props.iso2 ?? null) as string | null;
}

function getCountryName(props: Record<string, any>): string {
  return String(props.name ?? props.NAME ?? props.ADMIN ?? "Unknown");
}

export function WorldMap(props: {
  geojson: GeoJSONFeatureCollection;
  selectedCode: string | null;
  onSelect: (country: { code: string; name: string }) => void;
}) {
  const width = 1000;
  const height = 520;

  const paths = useMemo(() => {
    return props.geojson.features
      .map((f, idx) => {
        const code = getCountryCode(f.properties);
        if (!code) return null;

        const name = getCountryName(f.properties);
        const d = featureToPath(f, width, height);

        // guard: skip empty path strings
        if (!d) return null;

        return { idx, code: String(code), name, d };
      })
      .filter(Boolean) as Array<{ idx: number; code: string; name: string; d: string }>;
  }, [props.geojson]);

  return (
    <div style={ui.mapWrap}>
      <svg viewBox={`0 0 ${width} ${height}`} style={ui.mapSvg}>
        {paths.map((p) => {
          const isSelected = props.selectedCode?.toLowerCase() === p.code.toLowerCase();
          return (
            <path
              key={p.idx}
              d={p.d}
              onClick={() => props.onSelect({ code: p.code, name: p.name })}
              style={ui.countryPath(isSelected)}
            >
              <title>
                {p.name} ({p.code})
              </title>
            </path>
          );
        })}
      </svg>

      {paths.length === 0 ? (
        <div style={ui.mapEmptyHint}>
          No paths rendered. (Likely code/name extraction mismatch or bad geojson.)
        </div>
      ) : null}
    </div>
  );
}
