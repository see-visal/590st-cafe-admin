"use client";

/**
 * Speech-bubble validation alert, matching Coffee-Shop-UI's auth screens:
 * a white card with an orange "!" badge and a pointer aimed at the field above.
 */
export function TooltipAlert({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="relative z-30 mt-1.5 mb-1 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {/* Pointer, drawn as two stacked triangles so it reads as a bordered tail. */}
      <div className="absolute -top-[8px] left-6 h-0 w-0 border-r-[7px] border-b-[8px] border-l-[7px] border-r-transparent border-b-gray-400 border-l-transparent" />
      <div className="absolute -top-[6.5px] left-[25px] h-0 w-0 border-r-[6px] border-b-[7px] border-l-[6px] border-r-transparent border-b-white border-l-transparent" />

      <div className="inline-flex max-w-xs items-center gap-2.5 rounded-md border border-gray-400 bg-white p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-[#f95700] text-base font-bold text-white shadow-xs select-none">
          !
        </div>
        <span className="text-xs leading-tight font-normal text-gray-900">
          {message}
        </span>
      </div>
    </div>
  );
}
