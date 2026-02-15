import type { CSSProperties } from "react";

const z = 2147483647;

export const ui = {
  // Button
  fab: {
    position: "fixed",
    left: 16,
    bottom: 16,
    zIndex: z,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(20,20,24,0.92)",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    userSelect: "none",
  } satisfies CSSProperties,

  // Modal
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: z,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  } satisfies CSSProperties,

  modal: {
    width: "min(1100px, 96vw)",
    height: "min(720px, 92vh)",
    borderRadius: 18,
    background: "rgba(18,18,22,0.96)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  } satisfies CSSProperties,

  modalHeader: {
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  } satisfies CSSProperties,

  modalTitle: {
    color: "white",
    fontWeight: 700,
    fontSize: 15,
  } satisfies CSSProperties,

  modalCloseBtn: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 600,
  } satisfies CSSProperties,

  modalBody: {
    flex: 1,
    minHeight: 0,
  } satisfies CSSProperties,

  // Layout
  overlayBody: {
    display: "flex",
    height: "100%",
  } satisfies CSSProperties,

  // Map
  mapWrap: {
    width: "100%",
    height: "100%",
    padding: 12,
    boxSizing: "border-box",
    position: "relative",
  } satisfies CSSProperties,

  mapSvg: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "block",
  } satisfies CSSProperties,

  countryPath: (selected: boolean): CSSProperties => ({
    cursor: "pointer",
    fill: selected ? "rgba(80,160,255,0.45)" : "rgba(255,255,255,0.10)",
    stroke: "rgba(255,255,255,0.22)",
    strokeWidth: 0.6,
  }),

  mapEmptyHint: {
    position: "absolute",
    left: 22,
    bottom: 22,
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "white",
    fontSize: 12,
    opacity: 0.85,
  } satisfies CSSProperties,

  // Panel
  panel: {
    width: 360,
    borderLeft: "1px solid rgba(255,255,255,0.10)",
    padding: 14,
    boxSizing: "border-box",
    color: "white",
    overflow: "auto",
  } satisfies CSSProperties,

  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 8,
  } satisfies CSSProperties,
};
