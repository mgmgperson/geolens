import type { CountryAgg, RoundEvent, ISO2 } from "./schema";
import { updateOnlineMean } from "./onlineStats";

export function initCountryAgg(country: ISO2): CountryAgg {
    return { country, total: 0, correct: 0, avgScore: 0 };
}


/**
 * Updates the CountryAgg with a new RoundEvent. Only updates if the actual country of the round matches the agg's country.
 * @param agg The existing CountryAgg to update
 * @param round The new RoundEvent to apply
 * @returns An updated CountryAgg with the new round applied
 */
export function applyRoundToCountryAgg(agg: CountryAgg, round: RoundEvent): CountryAgg {
    const actual = round.actualCountry;
    if (!actual || actual !== agg.country) return agg;

    const total = agg.total + 1;
    const correct = agg.correct + (round.guessCountry === actual ? 1 : 0);

    const score = round.score ?? 0;
    const avgScore = updateOnlineMean(agg.avgScore, agg.total, score);

    return { ...agg, total, correct, avgScore };
}