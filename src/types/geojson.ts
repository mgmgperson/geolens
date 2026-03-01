export type CountryGeom =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

export interface CountryFeature {
  type: "Feature";
  properties: {
    code?: string;
    name?: string;
    [key: string]: any;
  };
  geometry: CountryGeom;
}

export interface CountryFeatureCollection {
  type: "FeatureCollection";
  features: CountryFeature[];
}
