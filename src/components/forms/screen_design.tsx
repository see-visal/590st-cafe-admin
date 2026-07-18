import React from 'react';

// 1. Define the TypeScript type for our color swatches
interface ColorSwatch {
  hex: string;
  name: string;
  // We can pass tailwind class names or raw hexes
  bgClass: string; 
}

interface PaletteGroup {
  groupName: string;
  colors: ColorSwatch[];
}

export default function PaletteExplorer() {
  // 2. Easily manage your color data here
  const paletteGroups: PaletteGroup[] = [
    {
      groupName: "Primary Colors",
      colors: [
        { name: "Primary Black", hex: "#000000", bgClass: "bg-[var(--primary_black)]" },
        { name: "Primary Yellow", hex: "#FFD200", bgClass: "bg-[var(--primary_yellow)]" },
      ]
    },
    {
      groupName: "Secondary Colors",
      colors: [
        { name: "Secondary 90", hex: "#027F8D", bgClass: "bg-[#027F8D]" },
        { name: "Secondary 80", hex: "#188B98", bgClass: "bg-[#188B98]" },
      ]
    }
  ];

  return (
    <div className="bg-[#faf8f5] font-sans text-[#111] min-h-screen leading-relaxed">
      
      {/* HEADER BANNER */}
      <header className="bg-[var(--primary_yellow)] px-[5%] py-10 mb-10">
        <h1 className="text-[32px] font-extrabold tracking-tight">
          Brand <span className="text-[#027F8D]">Color Palette</span>
        </h1>
      </header>

      {/* CONTAINER */}
      <main className="max-w-[1100px] mx-auto px-5 pb-[60px]">
        <h2 className="text-[28px] font-bold mb-[30px] tracking-tight">System Swatches</h2>

        {/* Dynamic Palette Groups */}
        {paletteGroups.map((group) => (
          <section key={group.groupName} className="mb-[45px]">
            {/* GROUP LABEL */}
            <h3 className="text-[11px] text-[#a0a0a0] uppercase tracking-[0.5px] mb-3 border-b border-[#f0f0f0] pb-2 font-semibold">
              {group.groupName}
            </h3>
            
            {/* GRID SYSTEM */}
            <div className="grid gap-[15px] grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
              {group.colors.map((color) => (
                <div key={color.hex} className="flex flex-col group">
                  
                  {/* SWATCH ITEM */}
                  <div 
                    className={`${color.bgClass} w-full aspect-video rounded-lg mb-2 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5`}
                    title={`Click to copy ${color.hex}`}
                    onClick={() => {
                      navigator.clipboard.writeText(color.hex);
                      alert(`Copied ${color.hex} to clipboard!`);
                    }}
                  />
                  
                  {/* INFO */}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold tracking-wider">{color.hex}</span>
                    <span className="text-[10px] text-[#777] mt-[2.5px]">{color.name}</span>
                  </div>

                </div>
              ))}
            </div>
          </section>
        ))}

      </main>
    </div>
  );
}