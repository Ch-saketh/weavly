export default function ZyraIcon({ size = 16, className = "" }) {
  return (
    <img
      src="/zyra_SVG.svg"
      alt="Zyra"
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
