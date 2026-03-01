import React, { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import type { CountryFeature, CountryFeatureCollection } from "../../types/geojson";
import type { CountryAgg } from "../../core/schema";
import type { VisualizationMode } from "./GeoLensOverlay";
import { ui } from "./styles";

function getCountryCode(props: Record<string, any>): string | null {
  const c = props.code ?? props.ISO_A2 ?? props.iso_a2 ?? props.POSTAL ?? null;
  return c ? String(c) : null;
}

function getCountryName(props: Record<string, any>): string {
  return String(props.name ?? props.NAME ?? props.ADMIN ?? "Unknown");
}

function interpolateColor(ratio: number): string {
  // ratio from 0 (red) to 1 (green)
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  
  const r = Math.round(255 * (1 - clampedRatio));
  const g = Math.round(255 * clampedRatio);
  const b = 0;
  
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
}

function getCountryColor(
  code: string,
  allStats: Map<string, CountryAgg>,
  vizMode: VisualizationMode
): string | null {
  if (vizMode === "none") return null;
  
  const stats = allStats.get(code.toLowerCase());
  if (!stats) return null;
  
  if (vizMode === "accuracy") {
    if (stats.total === 0) return null;
    const ratio = stats.correct / stats.total;
    return interpolateColor(ratio);
  }
  
  if (vizMode === "score") {
    const ratio = Math.min(stats.avgScore / 5000, 1);
    return interpolateColor(ratio);
  }
  
  return null;
}

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

function featureToPath(feature: CountryFeature, width: number, height: number): string {
  const g = feature.geometry;
  if (g.type === "Polygon") return polygonToPath(g.coordinates, width, height);
  return g.coordinates.map((poly) => polygonToPath(poly, width, height)).join(" ");
}

export function WorldMap(props: {
  geojson: CountryFeatureCollection;
  selectedCode: string | null;
  onSelect: (country: { code: string; name: string }) => void;
  allStats: Map<string, CountryAgg>;
  vizMode: VisualizationMode;
  onVizModeChange: (mode: VisualizationMode) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const [transform, setTransform] = useState<ZoomTransform>(() => zoomIdentity);

  const width = 1000;
  const height = 520;

  const paths = useMemo(() => {
    return props.geojson.features
      .map((f, idx) => {
        const code = getCountryCode(f.properties);
        if (!code) return null;
        const name = getCountryName(f.properties);
        const d = featureToPath(f, width, height);
        if (!d) return null;
        return { idx, code: String(code), name, d };
      })
      .filter(Boolean) as Array<{ idx: number; code: string; name: string; d: string }>;
  }, [props.geojson]);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);

    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on("zoom", (event) => {
        const t = event.transform as ZoomTransform;
        g.attr("transform", t.toString());
        setTransform(t);
      });

    svg.call(z as any);

    svg.call(z.transform as any, zoomIdentity);

    return () => {
      svg.on(".zoom", null);
    };
  }, []);

  const selectedLower = props.selectedCode?.toLowerCase() ?? null;

  return (
    <div style={ui.mapWrap}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={ui.mapSvg}
      >
        <g ref={gRef}>
          {paths.map((p) => {
            const isSelected = selectedLower === p.code.toLowerCase();
            const choroplethColor = getCountryColor(p.code, props.allStats, props.vizMode);
            return (
              <path
                key={p.idx}
                d={p.d}
                onClick={() => props.onSelect({ code: p.code, name: p.name })}
                style={ui.countryPath(isSelected, choroplethColor)}
              >
                <title>
                  {p.name} ({p.code})
                </title>
              </path>
            );
          })}
        </g>
      </svg>

      <div style={ui.mapZoomHint}>
        Zoom: {transform.k.toFixed(2)}x
      </div>

      <div style={ui.mapVizControls}>
        <button
          style={ui.vizBtn(props.vizMode === "none")}
          onClick={() => props.onVizModeChange("none")}
        >
          Default
        </button>
        <button
          style={ui.vizBtn(props.vizMode === "accuracy")}
          onClick={() => props.onVizModeChange("accuracy")}
        >
          Accuracy
        </button>
        <button
          style={ui.vizBtn(props.vizMode === "score")}
          onClick={() => props.onVizModeChange("score")}
        >
          Avg Score
        </button>
      </div>
    </div>
  );
}