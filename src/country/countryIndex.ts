import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { ISO2 } from "../core/schema";
import type { CountryFeature } from "../types/geojson";

type CountryGeom = Polygon | MultiPolygon;

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
        if (!res.ok) throw new Error(`Failed to load country geojson: ${res.status}`);

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
     * If the point is not within any country polygon, searches for the nearest country within a threshold distance.
     * @param lat The latitude of the point to check.
     * @param lng The longitude of the point to check.
     * @returns The ISO2 country code if the point is within a country polygon or near one, or null if not found or if the index is not initialized.
     * @throws An error if the index has not been initialized by calling init() first.
     */
    countryOf(lat: number, lng: number): ISO2 | null {
        if (!this.loaded) throw new Error("CountryIndex not initialized. Call init() first.");

        // GeoJSON point is [lng, lat]
        const p: [number, number] = [lng, lat];

        // First pass: exact point-in-polygon check
        for (const e of this.entries) {
            const [minLng, minLat, maxLng, maxLat] = e.bbox;
            if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue;

            if (booleanPointInPolygon(p as any, e.feature as any)) return e.iso2;
        }

        // Second pass: find nearest country within threshold (for coastal areas)
        const maxDistance = 0.5; // degrees (~55km at equator)
        let nearest: { iso2: ISO2; distance: number } | null = null;

        for (const e of this.entries) {
            const distToBBox = distanceToBox(lng, lat, e.bbox);
            if (distToBBox > maxDistance) continue;

            // within threshold, this is a candidate
            if (!nearest || distToBBox < nearest.distance) {
                nearest = { iso2: e.iso2, distance: distToBBox };
            }
        }

        return nearest?.iso2 ?? null;
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

/**
 * Computes the minimum distance from a point to a bounding box.
 * Returns 0 if the point is inside the box.
 * @param lng The longitude of the point.
 * @param lat The latitude of the point.
 * @param bbox The bounding box as [minLng, minLat, maxLng, maxLat].
 * @returns The minimum distance in degrees from the point to the box edge.
 */

function distanceToBox(lng: number, lat: number, bbox: [number, number, number, number]): number {
    const [minLng, minLat, maxLng, maxLat] = bbox;

    // If point is inside the box, distance is 0
    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) return 0;

    // Compute closest point on box
    const closestLng = Math.max(minLng, Math.min(maxLng, lng));
    const closestLat = Math.max(minLat, Math.min(maxLat, lat));

    // Euclidean distance in degrees
    const dLng = lng - closestLng;
    const dLat = lat - closestLat;
    return Math.sqrt(dLng * dLng + dLat * dLat);
}