"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  label?: string;
}

export default function Countdown({ label = "Ends in" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0); // Midnight tonight
      
      const difference = tomorrow.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm font-bold text-mint-800">{label}</span>}
      <div className="flex gap-2">
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold px-2 py-1 rounded-md min-w-[36px] text-center">
          {formatNumber(timeLeft.hours)}
        </div>
        <span className="text-red-500 font-bold py-1">:</span>
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold px-2 py-1 rounded-md min-w-[36px] text-center">
          {formatNumber(timeLeft.minutes)}
        </div>
        <span className="text-red-500 font-bold py-1">:</span>
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold px-2 py-1 rounded-md min-w-[36px] text-center">
          {formatNumber(timeLeft.seconds)}
        </div>
      </div>
    </div>
  );
}
