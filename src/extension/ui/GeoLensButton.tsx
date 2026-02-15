import { ui } from "./styles";

export function GeoLensButton(props: { onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      style={ui.fab}
      aria-label="Open GeoLens"
      title="GeoLens"
    >
      🌍 GeoLens
    </button>
  );
}
