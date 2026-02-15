const RESULT_ROOT_CLASS_PREFIX = "result-layout_root__";

function hasResultsOverlay(): boolean {
  return !!document.querySelector(
    `[class^="${RESULT_ROOT_CLASS_PREFIX}"], [class*=" ${RESULT_ROOT_CLASS_PREFIX}"]`
  );
}

export function onRoundOrGameResultsShown(cb: () => void): () => void {
  let lastVisible = hasResultsOverlay();
  let scheduled = false;

  const check = () => {
    const visible = hasResultsOverlay();
    if (!lastVisible && visible) cb();
    lastVisible = visible;
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
