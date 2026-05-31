import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  maxLength
}) => {
  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
        <SearchIcon className="text-lg" />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full pl-10 pr-10 py-2 text-sm bg-black/40 border border-zinc-800 focus:border-brand focus:outline-none rounded-xl text-white placeholder-zinc-500 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
        >
          <CloseIcon className="text-base" />
        </button>
      )}
    </div>
  );
};
