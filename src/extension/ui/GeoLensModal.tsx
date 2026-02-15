import React, { useEffect } from "react";
import { ui } from "./styles";

export function GeoLensModal(props: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
      style={ui.backdrop}
      aria-modal="true"
      role="dialog"
    >
      <div onMouseDown={(e) => e.stopPropagation()} style={ui.modal}>
        <div style={ui.modalHeader}>
          <div style={ui.modalTitle}>{props.title ?? "GeoLens"}</div>
          <button onClick={props.onClose} style={ui.modalCloseBtn}>
            Close
          </button>
        </div>

        <div style={ui.modalBody}>{props.children}</div>
      </div>
    </div>
  );
}
