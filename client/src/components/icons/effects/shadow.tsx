export const ShadowEffect = ({ filterId }: { filterId: string }) => {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="2"
            dy="2"
            stdDeviation="0"
            floodColor="rgba(0, 0, 0, 0.24)"
          />
        </filter>
      </defs>
    </svg>
  );
};
