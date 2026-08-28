import { cn } from "@/lib/utils";

export function StampProgress({
  current,
  total,
  compact = false,
}: {
  current: number;
  total: number;
  compact?: boolean;
}) {
  const safeTotal = Math.max(total, 1);
  const filledCount = Math.min(Math.max(current, 0), safeTotal);

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        compact ? "min-w-[108px]" : "min-w-[120px]"
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5" aria-hidden>
        {Array.from({ length: safeTotal }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "size-3.5 rounded-full border",
              index < filledCount
                ? "border-green-700 bg-[#befe35]"
                : "border-gray-300 bg-white"
            )}
          />
        ))}
      </div>
      <span className="text-[.6875rem] font-semibold text-gray-500">
        {filledCount}/{safeTotal}
      </span>
    </div>
  );
}
