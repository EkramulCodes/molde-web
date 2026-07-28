export function ContourBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.08] mix-blend-multiply flex items-center justify-center">
      <svg
        viewBox="0 0 1024 768"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full stroke-teal fill-none stroke-[1.5]"
      >
        <path d="M-50,200 Q150,150 300,300 T600,400 T950,250" />
        <path d="M-50,250 Q170,220 320,350 T620,450 T980,300" />
        <path d="M-50,300 Q190,290 340,400 T640,500 T1010,350" />
        <path d="M-50,350 Q210,360 360,450 T660,550 T1040,400" />
        <circle cx="800" cy="600" r="150" opacity="0.5" />
        <circle cx="800" cy="600" r="200" opacity="0.3" />
        <circle cx="800" cy="600" r="250" opacity="0.1" />
      </svg>
    </div>
  );
}
