import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

export type ISO2 = string;

type CountryGeom = Polygon | MultiPolygon;
type CountryFeature = Feature<CountryGeom, { code?: string; name?: string; country?: string }>;

interface CountryEntry {
    iso2: ISO2; // lowercase
    feature: CountryFeature;
    // bbox = [minLng, minLat, maxLng, maxLat]
    bbox: [number, number, number, number];
}

export class CountryIndex {
    private entries: CountryEntry[] = [];
    private loaded = false;

    constructor(private readonly geojsonUrl: string) {}

    async init(): Promise<void> {
        if (this.loaded) return;

        const res = await fetch(this.geojsonUrl);
        if (!res.ok) throw new Error(`Failed to load geolens_countries.json: ${res.status}`);

        const fc = (await res.json()) as FeatureCollection<CountryGeom, any>;
        const entries: CountryEntry[] = [];

        for (const f of fc.features ?? []) {
        if (!f?.geometry) continue;

        const code = f.properties?.code;
        if (!code || typeof code !== "string") continue;

        const iso2 = code.toLowerCase();
        const feature = f as CountryFeature;
        const bbox = computeBBox(feature);

        entries.push({ iso2, feature, bbox });
        }

        entries.sort((a, b) => bboxArea(a.bbox) - bboxArea(b.bbox));

        this.entries = entries;
        this.loaded = true;
    }

    /**
     * Returns the ISO2 country code for the given latitude and longitude, or null if not found.
     * @param lat The latitude of the point to check.
     * @param lng The longitude of the point to check.
     * @returns The ISO2 country code if the point is within a country polygon, or null if not found or if the index is not initialized.
     * @throws An error if the index has not been initialized by calling init() first.
     */
    countryOf(lat: number, lng: number): ISO2 | null {
        if (!this.loaded) throw new Error("CountryIndex not initialized. Call init() first.");

        // GeoJSON point is [lng, lat]
        const p: [number, number] = [lng, lat];

        for (const e of this.entries) {
        const [minLng, minLat, maxLng, maxLat] = e.bbox;
        if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue;

        if (booleanPointInPolygon(p as any, e.feature as any)) return e.iso2;
        }

        return null;
    }
}

/**
 * Computes the bounding box of a GeoJSON feature. The bbox is returned as [minLng, minLat, maxLng, maxLat].
 * @param feature The GeoJSON feature to compute the bounding box for. Must have a geometry of type Polygon or MultiPolygon.
 * @returns The bounding box of the feature as [minLng, minLat, maxLng, maxLat]. If the feature has no valid coordinates, returns the global bbox [-180, -90, 180, 90].
 */

function computeBBox(feature: Feature<CountryGeom>): [number, number, number, number] {
    const coords = feature.geometry.coordinates as any;

    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

    const visitPoint = (pt: any) => {
        const lng = pt[0], lat = pt[1];
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    };

    const walk = (node: any) => {
        if (!Array.isArray(node) || node.length === 0) return;

        if (typeof node[0] === "number" && typeof node[1] === "number") {
        visitPoint(node);
        return;
        }
        for (const child of node) walk(child);
    };

    walk(coords);

    if (!Number.isFinite(minLng)) return [-180, -90, 180, 90];
    return [minLng, minLat, maxLng, maxLat];
}

/**
 * Computes the area of a bounding box defined by [minLng, minLat, maxLng, maxLat].
 * @param b The bounding box as [minLng, minLat, maxLng, maxLat].
 * @returns The area of the bounding box, or 0 if the box is invalid.
 */

function bboxArea(b: [number, number, number, number]): number {
    const [minLng, minLat, maxLng, maxLat] = b;
    return Math.max(0, maxLng - minLng) * Math.max(0, maxLat - minLat);
}