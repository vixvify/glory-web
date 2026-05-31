import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconClassName?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconClassName = "bg-brand/10 border-brand/20 text-brand"
}) => {
  return (
    <div className="bg-card border border-zinc-800/40 p-5 rounded-2xl flex items-center gap-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-brand/35 hover:-translate-y-0.5">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconClassName}`}>
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold text-[10px]">
          {title}
        </p>
        <h3 className="text-2xl font-black">{value}</h3>
      </div>
    </div>
  );
};
