import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="UFSC e EGC">
      <Image src="/brand/ufsc.png" width={155} height={66} alt="Universidade Federal de Santa Catarina" priority unoptimized />
      <span className="brand__divider" aria-hidden="true" />
      <Image src="/brand/egc.png" width={145} height={66} alt="Engenharia, Gestão e Mídia do Conhecimento" priority unoptimized />
      {!compact && (
        <span className="brand__title">
          <strong>Research Canvas EGC</strong>
          <small>PPGEGC / UFSC</small>
        </span>
      )}
    </div>
  );
}
