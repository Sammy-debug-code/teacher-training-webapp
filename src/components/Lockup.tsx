import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";

/** Bethel lockup: seal + two-line name. Falls back to a text seal until public/brand/seal.png exists. */
export default function Lockup({ compact = false }: { compact?: boolean }) {
  const hasSeal = existsSync(path.join(process.cwd(), "public", "brand", "seal.png"));
  const size = compact ? 36 : 48;
  return (
    <div className="flex items-center gap-3">
      {hasSeal ? (
        <Image src="/brand/seal.png" alt="" width={size} height={size} className="rounded-full" priority />
      ) : (
        <div
          aria-hidden
          className="flex items-center justify-center rounded-full bg-purple font-serif font-semibold text-gold ring-2 ring-gold"
          style={{ width: size, height: size, fontSize: size * 0.45 }}
        >
          B
        </div>
      )}
      <div className="font-sans uppercase leading-none tracking-wide text-white">
        <div className="text-[13px] font-bold">Bethel Mission</div>
        <div className="text-[13px]">
          <span className="font-bold">School</span>{" "}
          <span className="font-normal">Kishanganj</span>
        </div>
      </div>
    </div>
  );
}
