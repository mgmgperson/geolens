import type { GameRecord, RoundEvent } from "../core/schema";
import type { CountryIndex } from "../country/countryIndex";

function num(x: any): number | undefined {
  const n = typeof x === "number" ? x : typeof x === "string" ? Number(x) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Normalizes the raw game data fetched from the Geoguessr API into a consistent GameRecord format.
 * @param params The parameters for normalization, including the game token, raw data, import timestamp, and country index for mapping lat/lng to countries.
 * @returns A promise that resolves to a normalized GameRecord object containing the game details and rounds with enriched country information.
 * @throws An error if the normalization process encounters invalid data or if required fields are missing.
 */
export async function normalizeClassicGameV3(params: {
    token: string;
    raw: any;
    importedAtMs?: number;
    countryIndex: CountryIndex;
}): Promise<GameRecord> {
    const { token, raw, countryIndex } = params;
    const importedAtMs = params.importedAtMs ?? Date.now();

    const rounds = Array.isArray(raw?.rounds) ? raw.rounds : [];
    const guesses = Array.isArray(raw?.player?.guesses) ? raw.player.guesses : [];

    const outRounds: RoundEvent[] = [];
    const n = Math.max(rounds.length, guesses.length);

    for (let i = 0; i < n; i++) {
        const r = rounds[i];
        const g = guesses[i];

        // actual location
        const actualLat = num(r?.lat);
        const actualLng = num(r?.lng);

        // guessed location
        const guessLat = num(g?.lat);
        const guessLng = num(g?.lng);

        if (actualLat == null || actualLng == null) continue;
        if (guessLat == null || guessLng == null) continue;

        const actualCountry = countryIndex.countryOf(actualLat, actualLng);
        const guessCountry = countryIndex.countryOf(guessLat, guessLng);

        const score = num(g?.roundScoreInPoints) ?? num(g?.roundScore?.amount);
        const distanceMeters = num(g?.distanceInMeters);
        const timeSeconds = num(g?.time);

        const endedAtMs =
        r?.startTime ? Date.parse(r.startTime) + (timeSeconds ?? 0) * 1000 : importedAtMs;

        outRounds.push({
        gameToken: token,
        roundIndex: i,
        endedAtMs,
        actual: { lat: actualLat, lng: actualLng },
        guess: { lat: guessLat, lng: guessLng },
        actualCountry,
        guessCountry,
        score,
        distanceMeters,
        timeSeconds,
        });
    }

    return {
        gameToken: token,
        importedAtMs,
        type: raw?.type,
        mode: raw?.mode,
        state: raw?.state,
        mapName: raw?.mapName,
        roundCount: num(raw?.roundCount),
        raw, // keep for future analytics/debug
        rounds: outRounds,
    };
}
