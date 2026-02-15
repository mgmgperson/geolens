const INGAME_PREFIXES = ["in-game_layout__", "game_canvas__"];
const PLAY_AGAIN_CLASS_PREFIXES = ["standard-final-result_primaryButton__"];

const PLAY_AGAIN_SELECTOR = '[data-qa="play-again-button"]';

function hasInGameUI() {
    return INGAME_PREFIXES.some((p) =>
        document.querySelector(`[class^="${p}"], [class*=" ${p}"]`)
    );
}

export function onGameStartedUIShown(cb: () => void) {
    let last = hasInGameUI();
    let scheduled = false;

    const check = () => {
        const cur = hasInGameUI();
        if (!last && cur) cb();
        last = cur;
    };

    const trigger = () => {
        if (scheduled) return;
        scheduled = true;
        queueMicrotask(() => {
        scheduled = false;
        check();
        });
    };

    const obs = new MutationObserver(trigger);
    obs.observe(document.documentElement, { childList: true, subtree: true });
    trigger();

    return () => obs.disconnect();
}

function hasPlayAgainButton(): boolean {
    if (document.querySelector(PLAY_AGAIN_SELECTOR)) return true;

    return PLAY_AGAIN_CLASS_PREFIXES.some((p) =>
        document.querySelector(`[class^="${p}"], [class*=" ${p}"]`)
    );
}

export function onPlayAgainButtonDisappeared(cb: () => void): () => void {
    let lastVisible = hasPlayAgainButton();
    let scheduled = false;

    const check = () => {
        const curVisible = hasPlayAgainButton();
        if (lastVisible && !curVisible) cb(); // visible -> not visible
        lastVisible = curVisible;
    };

    const trigger = () => {
        if (scheduled) return;
        scheduled = true;
        queueMicrotask(() => {
        scheduled = false;
        check();
        });
    };

    const obs = new MutationObserver(trigger);
    obs.observe(document.documentElement, { childList: true, subtree: true });

    // initial check
    trigger();
    return () => obs.disconnect();
}