import React from "react";

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: FilterSelectOption[];
  className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-zinc-400 font-semibold whitespace-nowrap">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-1.5 focus:border-brand focus:outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
