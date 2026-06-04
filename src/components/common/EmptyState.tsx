"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export function EmptyState({ title, description, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 text-center">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
      {actionLabel && (
        <button className="mt-2 rounded-md bg-lime-300 px-4 py-1.5 text-xs font-semibold text-black">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
