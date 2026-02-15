import { fetchClassicGame } from "./fetchGame";
import { normalizeClassicGameV3 } from "./normalizeGame";
import { applyRoundToCountryAgg, initCountryAgg } from "../core/analytics";
import type { CountryIndex } from "../country/countryIndex";
import { gameRepo, countryAggRepo } from "../storage/indexedDbRepos";
import { log } from "../core/logger";

/**
 * Imports a finished classic game by its token. Fetches the raw game data, normalizes it, saves it to the game repository, and updates country aggregates accordingly.
 * @param token The unique token identifying the Geoguessr game to import. Must correspond to a finished game, otherwise the import will be aborted.
 * @param countryIndex The CountryIndex instance used to map lat/lng coordinates to country codes during normalization. This should be initialized before calling this function.
 * @returns An object indicating whether the import was successful and, if not, the reason for failure (e.g., already imported, game not finished).
 */
export async function importFinishedClassicGame(token: string, countryIndex: CountryIndex) {
    if (await gameRepo.hasGame(token)) {
        log.info("Import skipped (already imported):", token);
        return { imported: false as const, reason: "already-imported" as const };
    }

    log.info("Fetching game:", token);
    const raw = await fetchClassicGame(token);

    log.debug("Fetched game state:", raw?.state, "mode:", raw?.mode, "roundCount:", raw?.roundCount);

    if (raw?.state !== "finished") {
        log.info("Import skipped (not finished):", token, "state:", raw?.state);
        return { imported: false as const, reason: "not-finished" as const };
    }

    const game = await normalizeClassicGameV3({ token, raw, countryIndex });

    log.info("Normalized rounds:", game.rounds.length, "token:", token);

    await gameRepo.saveGame(game);

    let updatedCountries = 0;

    for (const round of game.rounds) {
        const actual = round.actualCountry;
        if (!actual) continue;

        const existing = (await countryAggRepo.get(actual)) ?? initCountryAgg(actual);
        const updated = applyRoundToCountryAgg(existing, round);
        await countryAggRepo.upsert(updated);

        updatedCountries++;
    }

    log.info("Imported finished game:", token, "updatedAggWrites:", updatedCountries);

    return { imported: true as const, reason: "ok" as const };
}