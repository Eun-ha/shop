import React from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-on-surface/80">{label}</label>}
    <input
      className={clsx(
        "rounded border border-outline bg-surface px-3 py-2 text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary",
        error ? "border-sale" : "border-outline",
        className
      )}
      {...props}
    />
    {error && <span className="text-xs text-sale">{error}</span>}
  </div>
);
