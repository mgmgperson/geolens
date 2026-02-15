import { log } from "../core/logger";

/**
 * Extracts the game token from a classic Geoguessr game URL.
 * @param url The URL to extract the token from. Defaults to the current page URL.
 * @returns The game token if found, or null if the URL does not match the expected pattern.
 */
export function getClassicGameTokenFromUrl(url: string = location.href): string | null {
    try {
        const u = new URL(url);
        // Classic games: /game/<token>
        const m = u.pathname.match(/^\/game\/([A-Za-z0-9_-]+)$/);
        log.debug("Extracted token from URL:", m?.[1] ?? null, "URL:", url);
        return m?.[1] ?? null;
    } catch (e) {
        log.debug("Failed to extract token from URL:", e, "URL:", url);
        return null;
    }
}

/**
 * Listens for changes to the game token in the URL and calls the provided callback with the new token whenever it changes.
 * @param cb A callback function that will be called with the new game token whenever it changes. The token will be null if the URL does not contain a valid game token.
 * @returns A function that can be called to stop listening for changes to the game token.
 */
export function onGameTokenChange(cb: (token: string | null) => void): () => void {
    let last = getClassicGameTokenFromUrl();

    const emitIfChanged = () => {
        const cur = getClassicGameTokenFromUrl();
        if (cur !== last) {
        last = cur;
        cb(cur);
        }
    };

    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function (this: History, ...args: Parameters<History['pushState']>) {
        origPush.apply(this, args);
        emitIfChanged();
    };

    history.replaceState = function (this: History, ...args: Parameters<History['replaceState']>) {
        origReplace.apply(this, args);
        emitIfChanged();
    };

    window.addEventListener("popstate", emitIfChanged);

    cb(last);

    return () => {
        history.pushState = origPush;
        history.replaceState = origReplace;
        window.removeEventListener("popstate", emitIfChanged);
    };
}
