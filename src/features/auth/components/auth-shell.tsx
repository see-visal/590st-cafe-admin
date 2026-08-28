import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Auth chrome: a rounded white card floating on a soft grey page, split into the
 * form column and the campaign artwork. The artwork is hidden below `lg` so small
 * screens get the form at full width.
 */
export function AuthShell({
  children,
  /** Widens the form column for longer forms such as sign-up. */
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#ececec] p-3 sm:p-6">
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-sm lg:grid-cols-2">
        <span
          aria-hidden
          className="absolute top-6 left-6 z-10 size-4 rounded-full bg-black"
        />

        <section className="flex items-center justify-center px-6 py-14 sm:px-10">
          <div className={wide ? "w-full max-w-sm" : "w-full max-w-xs"}>
            {children}
          </div>
        </section>

        {/*
          `fill` pins the artwork to all four edges. The source SVG is a 473x550
          canvas holding a 433x510 artwork at (20,18) — roughly 4% transparent
          padding reserved for its drop shadow — so it is scaled past 1 to push
          that padding outside the panel and bleed edge to edge.
        */}
        <section
          aria-hidden
          className="relative hidden overflow-hidden bg-[#faf9f7] lg:block"
        >
          <Image
            src="/logos/slideshow.svg"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 0px"
            unoptimized
            priority
            className="scale-[1.12] object-cover object-center"
          />
        </section>
      </div>
    </main>
  );
}

/**
 * The 590st CAFE mark with the scattered hearts from the brand artwork.
 * The asset is white type on a black tile, so it sits on a black rounded chip.
 */
export function AuthLogo() {
  return (
    <div className="relative mx-auto w-fit">
      <Hearts />
      <Image
        src="/logos/logoWhite.svg"
        alt="590st CAFE"
        width={170}
        height={82}
        priority
        className="relative h-14 w-auto rounded-lg"
      />
    </div>
  );
}

/** Decorative hearts scattered around the logo, matching the brand artwork. */
function Hearts() {
  const hearts = [
    "-top-3 -left-7 size-4 rotate-[-18deg] text-[#e8365d]",
    "-top-5 left-1 size-2.5 rotate-[12deg] text-[#f4879f]",
    "-top-4 -right-6 size-3.5 rotate-[20deg] text-[#e8365d]",
    "top-1 -right-9 size-2 text-[#f4879f]",
    "-bottom-3 -left-8 size-3.5 rotate-[14deg] text-[#e8365d]",
    "-bottom-4 left-4 size-2.5 rotate-[-10deg] text-[#f4879f]",
    "-bottom-2 -right-7 size-3 rotate-[-16deg] text-[#e8365d]",
  ];

  return (
    <span aria-hidden>
      {hearts.map((position) => (
        <svg
          key={position}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`absolute ${position}`}
        >
          <path d="M12 21s-7.5-4.7-9.5-9A5.2 5.2 0 0 1 12 6.3 5.2 5.2 0 0 1 21.5 12c-2 4.3-9.5 9-9.5 9Z" />
        </svg>
      ))}
    </span>
  );
}
