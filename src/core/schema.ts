export const DATA_VERSION = "0.1.0" as const;

export type ISO2 = string;

export interface LatLng {
    lat: number;
    lng: number;
}

export interface RoundEvent {
    gameToken: string;
    roundIndex: number;
    endedAtMs: number;

    actual: LatLng;
    guess: LatLng;

    actualCountry?: ISO2 | null;
    guessCountry?: ISO2 | null;

    // from API
    score?: number;         // roundScoreInPoints
    distanceMeters?: number;// distanceInMeters
    timeSeconds?: number;   // guess.time
}

export interface GameRecord {
    gameToken: string;
    importedAtMs: number;

    type?: string;
    mode?: string;
    state?: string;

    mapName?: string;
    roundCount?: number;

    raw?: unknown;

    rounds: RoundEvent[];
}

export interface CountryAgg {
    country: ISO2;
    total: number;
    correct: number;
    avgScore: number;
}

export interface DbMeta {
    id: "meta";
    dataVersion: string;
    createdAtMs: number;
    updatedAtMs: number;
}