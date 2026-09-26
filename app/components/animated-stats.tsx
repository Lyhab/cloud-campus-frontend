"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  label: string;
  suffix?: string;
  compact?: boolean;
};

type AnimatedStatsProps = {
  stats: Stat[];
  statClassName: string;
  valueClassName: string;
};

const animationDuration = 1600;

function formatValue(value: number, compact = false) {
  if (compact) {
    return `${Math.floor(value / 1000)}K`;
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export default function AnimatedStats({
  stats,
  statClassName,
  valueClassName,
}: AnimatedStatsProps) {
  const containerRef = useRef<HTMLDListElement>(null);
  const [values, setValues] = useState(() => stats.map(() => 0));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrame = 0;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      animationFrame = requestAnimationFrame(() => {
        setValues(stats.map((stat) => stat.value));
      });

      return () => cancelAnimationFrame(animationFrame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const progress = Math.min(
            (currentTime - startTime) / animationDuration,
            1,
          );
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          setValues(
            stats.map((stat) => Math.floor(stat.value * easedProgress)),
          );

          if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
          }
        };

        animationFrame = requestAnimationFrame(animate);
      },
      { threshold: 0.35 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [stats]);

  return (
    <dl
      ref={containerRef}
      className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-5"
    >
      {stats.map((stat, index) => (
        <div key={stat.label} className={`flex flex-col ${statClassName}`}>
          <dt className="order-2 text-sm text-[#64748b] sm:text-base">
            {stat.label}
          </dt>
          <dd
            className={`order-1 mb-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl ${valueClassName}`}
          >
            {formatValue(values[index], stat.compact)}
            {stat.suffix}
          </dd>
        </div>
      ))}
    </dl>
  );
}
