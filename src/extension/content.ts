import { CountryIndex } from "../country/countryIndex";
import { onGameTokenChange, getClassicGameTokenFromUrl } from "../capture/tokenDetector";
import { onRoundOrGameResultsShown } from "../capture/finishDetector";
import { ensureDbInitialized } from "../storage/migrations";
import { importFinishedClassicGame } from "../capture/importFinishedGame";
import { log, setLogLevel } from "../core/logger";
import { mountGeoLensUI } from "./mountUi";

(async function main() {
    // "debug" | "info" | "warn" | "error" | "silent"
    setLogLevel("debug");

    log.info("Content script boot");

    await ensureDbInitialized();
    log.info("DB initialized");

    mountGeoLensUI();
    log.info("UI mounted");

    const url = chrome.runtime.getURL("build/assets/geolens_countries.json");
    const countryIndex = new CountryIndex(url);
    await countryIndex.init();

    log.info("CountryIndex loaded");

    let currentToken: string | null = getClassicGameTokenFromUrl();
    log.debug("Initial token:", currentToken);

    onGameTokenChange((t) => {
        currentToken = t;
        log.debug("Token changed:", currentToken);
    });

    onRoundOrGameResultsShown(async () => {
        const token = currentToken;
        if (!token) return;

        log.debug("Results overlay detected; attempting import:", token);

        const res = await importFinishedClassicGame(token, countryIndex);

        // importFinishedClassicGame already logs, but this is handy for quick confirmation
        if (res.imported) {
            log.info("Import success:", token);
        } else {
            log.debug("Import skipped:", res.reason, token);
        }
    });
})();
