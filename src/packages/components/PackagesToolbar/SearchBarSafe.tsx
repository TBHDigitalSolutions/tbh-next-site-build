// src/packages/components/PackagesToolbar/SearchBarSafe.tsx
"use client";

import * as React from "react";
import SearchBar from "@/search/ui/SearchBar";

/**
 * Narrow wrapper that ONLY forwards props that SearchBar
 * is known to handle and does not leak unknown props like `inputProps`.
 */
export type SearchBarSafeProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export default function SearchBarSafe({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
}: SearchBarSafeProps) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      inputClassName={inputClassName}
    />
  );
}
