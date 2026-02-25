import React from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={clsx(
        "rounded border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500",
        error ? "border-red-500" : "border-gray-300",
        className
      )}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);
