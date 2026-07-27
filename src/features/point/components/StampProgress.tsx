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
    <div className={cn("stamp_progress", compact && "is_compact")}>
      <div className="stamp_progress_track" aria-hidden>
        {Array.from({ length: safeTotal }).map((_, index) => (
          <span
            key={index}
            className={cn("stamp_dot", index < filledCount && "is_filled")}
          />
        ))}
      </div>
      <span className="stamp_progress_label">
        {filledCount}/{safeTotal}
      </span>
    </div>
  );
}
