"use client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PinPad({
  value,
  onChange,
  length = 4,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  disabled?: boolean;
}) {
  function press(k: string) {
    if (disabled) return;
    if (k === "⌫") return onChange(value.slice(0, -1));
    if (!k || value.length >= length) return;
    onChange(value + k);
  }
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-4" aria-label={`PIN, ${value.length} of ${length} digits entered`}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-purple transition ${
              i < value.length ? "bg-purple" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="grid w-full max-w-[280px] grid-cols-3 gap-3">
        {KEYS.map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => press(k)}
              disabled={disabled}
              aria-label={k === "⌫" ? "Delete" : k}
              className="h-16 rounded-md border border-line-strong bg-raised text-2xl font-semibold text-ink active:bg-mist disabled:opacity-50"
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
