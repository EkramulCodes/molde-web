'use client';

import { useLanguage } from '../../../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  const values = [
    { num: '01', title: t.about.val1 },
    { num: '02', title: t.about.val2 },
    { num: '03', title: t.about.val3 },
    { num: '04', title: t.about.val4 },
  ];

  return (
    <div className="relative w-full overflow-x-hidden">
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-16 overflow-hidden min-h-[40vh] sm:min-h-[50vh] flex flex-col justify-center bg-contour topographic-bg">
        <div className="max-w-4xl relative z-10 text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal/10 border border-teal/20 text-teal rounded-full w-fit">
            <span className="font-mono text-xs uppercase tracking-widest font-bold">Nordic Digital Growth</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-ink uppercase tracking-tight break-words">
            {t.about.title}
          </h1>
          <p className="text-base sm:text-xl text-slate max-w-2xl leading-relaxed font-body">
            {t.about.subheadline}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-16 bg-bg-deep border-t border-slate/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-ink">
                {t.about.approachTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate leading-relaxed font-body">
                {t.about.approachP1}
              </p>
              <p className="text-sm sm:text-base text-slate leading-relaxed font-body">
                {t.about.approachP2}
              </p>
            </div>

            <div className="bento-card p-6 sm:p-8 md:p-10 rounded-2xl h-full min-h-[320px] flex flex-col justify-center text-left">
              <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-ink mb-2">
                {t.about.valuesTitle}
              </h3>
              <ul className="space-y-4 mt-6 w-full">
                {values.map((v) => (
                  <li key={v.num} className="flex items-center space-x-4 border-b border-slate/10 pb-4 last:border-b-0 last:pb-0">
                    <span className="font-mono text-gold font-bold text-base sm:text-lg">{v.num}</span>
                    <span className="font-bold uppercase tracking-wide text-ink text-xs sm:text-sm font-mono">{v.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

